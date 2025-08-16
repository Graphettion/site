// Initialize the map
        const map = L.map('map', {
            center: [34.05, -118.25],
            zoom: 8,
            minZoom: 2,
            maxZoom: 16
        });
        
        // Add base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // NASA GIBS Layer
        let gibsLayer = null;
        
        // Current event features
        let eventPolygons = [];
        let currentEvent = null;
        
        // Helper function to get style name
        function getStyleName(style) {
            const styles = {
                'default': 'Natural Color',
                'falsecolor': 'False Color (Urban)',
                'ndvi': 'Vegetation (NDVI)',
                'mndwi': 'Water (MNDWI)'
            };
            return styles[style] || style;
        }
        
        // Function to initialize GIBS layer
        function initGibsLayer(date = '2023-07-15', style = 'default') {
            if (gibsLayer) {
                map.removeLayer(gibsLayer);
            }
            
            // Update status bar
            document.querySelector('.status-bar span').textContent = 
                `Connected to NASA GIBS - Imagery for ${date} (${getStyleName(style)})`;
            
            // Update visualization info
            const visInfo = document.getElementById('visInfo');
            switch(style) {
                case 'default':
                    visInfo.textContent = "Natural Color: Shows Earth as seen by human eye";
                    break;
                case 'falsecolor':
                    visInfo.textContent = "False Color (Urban): Highlights urban areas and development";
                    break;
                case 'ndvi':
                    visInfo.textContent = "Vegetation (NDVI): Shows vegetation health and density";
                    break;
                case 'mndwi':
                    visInfo.textContent = "Water (MNDWI): Enhances water bodies and moisture";
                    break;
            }
            
            // Determine which tile layer to use based on selected style
            let tileUrl, attribution;
            
            switch(style) {
                case 'default':
                    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
                    attribution = 'Natural Color - Source: Esri, Maxar, Earthstar Geographics';
                    break;
                case 'falsecolor':
                    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
                    attribution = 'False Color (Urban) - Source: Esri, HERE, Garmin';
                    break;
                case 'ndvi':
                    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}';
                    attribution = 'Vegetation (NDVI) - Source: Esri, USGS, NOAA';
                    break;
                case 'mndwi':
                    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}';
                    attribution = 'Water (MNDWI) - Source: Esri, GEBCO, NOAA';
                    break;
                default:
                    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
                    attribution = 'NASA GIBS Demo';
            }
            
            // Create the tile layer
            gibsLayer = L.tileLayer(tileUrl, {
                attribution: attribution,
                maxZoom: 18
            });
            
            // Only add if toggle is on
            if (document.getElementById('layerToggle').checked) {
                gibsLayer.addTo(map);
            }
        }
        
        // Initialize with default values
        initGibsLayer();
        
        // DOM Elements
        const datePicker = document.getElementById('datePicker');
        const layerToggle = document.getElementById('layerToggle');
        const eventList = document.getElementById('eventList');
        const eventInfoElement = document.getElementById('eventInfo');
        const eventInfoName = document.getElementById('eventInfoName');
        const eventThumbnail = document.getElementById('eventThumbnail');
        const eventDetails = document.getElementById('eventDetails');
        const closeInfo = document.getElementById('closeInfo');
        const colorMapSelector = document.getElementById('colorMapSelector');
        
        // Set max date to today
        const today = new Date().toISOString().split('T')[0];
        datePicker.setAttribute('max', today);
        datePicker.value = '2023-07-15';

        // Event data
        fetch('preloaded_events.json')
          .then(response => response.json())
          .then(eventsData => renderEvents(eventsData))
          .catch(error => console.error('Error loading events:', error));
        
        // Render events to the list
        function renderEvents(events) {
            eventList.innerHTML = '';
            
            events.forEach(event => {
                const li = document.createElement('li');
                li.className = `event-item ${event.event_type.toLowerCase()}`;
                li.innerHTML = `
                    <div class="event-header">
                        <div class="event-name">${event.event_name}</div>
                        <div class="event-type">${event.event_type}</div>
                    </div>
                    <div class="event-coords">${event.date}</div>
                `;
                
                li.addEventListener('click', () => {
                    // Remove active class from all items
                    document.querySelectorAll('.event-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to clicked item
                    li.classList.add('active');
                    
                    // Store current event
                    currentEvent = event;
                    
                    // Update date picker to event's date
                    datePicker.value = event.date;
                    
                    // Update the layer
                    const activeStyle = document.querySelector('.color-map-item.active').dataset.value;
                    initGibsLayer(event.date, activeStyle);
                    
                    // Clear any existing polygons
                    clearEventPolygons();
                    
                    // Display event polygons
                    displayEventPolygons(event);
                    
                    // Show event info panel
                    showEventInfo(event);
                    
                    // Fit map to event bounding box
                    const bbox = event.bounding_box;
                    const bounds = L.latLngBounds(
                        [bbox[1], bbox[0]], // SW corner
                        [bbox[3], bbox[2]]  // NE corner
                    );
                    map.fitBounds(bounds, {padding: [50, 50]});
                });
                
                eventList.appendChild(li);
            });
        }
        
        // Display GeoJSON polygons for an event
        function displayEventPolygons(event) {
            const geojson = event.geojson;
            
            geojson.features.forEach(feature => {
                // Convert coordinates to Leaflet format [lat, lng]
                const latLngs = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                
                // Set color based on event type
                let color = '#e53e3e';
                if (event.event_type === 'Flood') color = '#2196f3';
                if (event.event_type === 'Drought') color = '#ffc107';
                if (event.event_type === 'Storm') color = '#ff9800';
                if (event.event_type === 'Volcano') color = '#9c27b0';
                
                const polygon = L.polygon(latLngs, {
                    color: color,
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.3
                }).addTo(map);
                
                // Add tooltip
                polygon.bindTooltip(event.event_name, {permanent: false, direction: 'top'});
                
                eventPolygons.push(polygon);
            });
        }
        
        // Clear existing event polygons
        function clearEventPolygons() {
            eventPolygons.forEach(polygon => {
                map.removeLayer(polygon);
            });
            eventPolygons = [];
        }
        
        // Show event information panel
        function showEventInfo(event) {
            eventInfoName.textContent = event.event_name;
            eventThumbnail.style.backgroundImage = `url('${event.thumbnail}')`;
            
            // Format bounding box coordinates
            const bbox = event.bounding_box;
            const bboxStr = `${bbox[1].toFixed(4)}, ${bbox[0].toFixed(4)} to ${bbox[3].toFixed(4)}, ${bbox[2].toFixed(4)}`;
            
            // Create details
            eventDetails.innerHTML = `
                <div class="event-detail-label">Event Type:</div>
                <div class="event-detail-value">${event.event_type}</div>
                <div class="event-detail-label">Date:</div>
                <div class="event-detail-value">${event.date}</div>
                <div class="event-detail-label">Location:</div>
                <div class="event-detail-value">${bboxStr}</div>
                <div class="event-detail-label">Description:</div>
                <div class="event-detail-value">${event.description}</div>
                <div class="event-detail-label">COG:</div>
                <div class="event-detail-value">
                    <a href="${event.cog}" target="_blank" class="event-link">Download COG</a>
                </div>
            `;
            
            eventInfoElement.classList.add('active');
        }
        
        // Event Handlers
        datePicker.addEventListener('change', function() {
            if (gibsLayer) {
                const activeStyle = document.querySelector('.color-map-item.active').dataset.value;
                initGibsLayer(this.value, activeStyle);
            }
        });
        
        layerToggle.addEventListener('change', function() {
            if (this.checked) {
                if (gibsLayer) {
                    gibsLayer.addTo(map);
                } else {
                    const activeStyle = document.querySelector('.color-map-item.active').dataset.value;
                    initGibsLayer(datePicker.value, activeStyle);
                }
            } else {
                if (gibsLayer) {
                    map.removeLayer(gibsLayer);
                }
            }
        });
        
        // Color map selection
        colorMapSelector.querySelectorAll('.color-map-item').forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all items
                colorMapSelector.querySelectorAll('.color-map-item').forEach(i => {
                    i.classList.remove('active');
                });
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Update the layer
                const style = this.dataset.value;
                initGibsLayer(datePicker.value, style);
            });
        });
        
        closeInfo.addEventListener('click', function() {
            eventInfoElement.classList.remove('active');
            // Clear active class from event items
            document.querySelectorAll('.event-item').forEach(item => {
                item.classList.remove('active');
            });
            // Clear polygons
            clearEventPolygons();
        });
        
        // Initial render
        renderEvents();
        
        // Add scale control
        L.control.scale({imperial: false}).addTo(map);
        
        // Add attribution
        const attribution = L.control.attribution({position: 'bottomleft'});
        attribution.addAttribution('NASA GIBS | OpenStreetMap');
        attribution.addTo(map);