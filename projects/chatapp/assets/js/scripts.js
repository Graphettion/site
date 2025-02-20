class ChatApp {
    constructor() {
      this.themeToggle = document.getElementById('themeToggle');
      this.chatMessages = document.getElementById('chatMessages');
      this.messageInput = document.getElementById('messageInput');
      this.sendButton = document.getElementById('sendButton');
      
      this.isDarkMode = false;
      
      this.initializeEventListeners();
    }

    initializeEventListeners() {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
      this.sendButton.addEventListener('click', () => this.sendMessage());
      this.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      document.body.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      this.themeToggle.textContent = this.isDarkMode ? '🌙' : '☀️';
    }

    sendMessage() {
      const message = this.messageInput.value.trim();
      if (message) {
        this.addMessage(message, 'sent');
        this.messageInput.value = '';
        
        // Simulate received message after a short delay
        setTimeout(() => {
          this.addMessage('This is a demo response!', 'received');
        }, 1000);
      }
    }

    addMessage(text, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = text;
      this.chatMessages.appendChild(messageDiv);
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  // Initialize the chat app
  const chat = new ChatApp();