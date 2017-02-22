import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify'

export default {
  entry: 'src/scripts/scripts.js',
  dest: 'js/scripts.min.js',
  format: 'iife',
  plugins: [
    babel(),
    uglify()
  ]
};