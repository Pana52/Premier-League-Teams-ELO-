const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',  // Ensure the correct entry point for React
  output: {
    path: path.resolve(__dirname, 'client/build'),  // Set to client/build
    filename: 'bundle.js',
    publicPath: '/',  // Ensure routing works with React Router
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // Ensure this points to your HTML template
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
    historyApiFallback: true,  // Required for React Router
    proxy: [
      {
        context: ['/api'],  // Define the context for which the proxy should apply
        target: 'http://localhost:3000',  // Your Express server
        secure: false,  // Set to false to allow self-signed certificates
        changeOrigin: true,  // Needed for virtual hosted sites
      },
    ],
  },
};
