#!/bin/bash
echo "🚀 Starting Sekawan FC Server..."
echo "🔧 Debug endpoints enabled"
echo "📱 FCM endpoints bypassing CSRF"
echo ""
echo "Server will be available at:"
echo "- Main site: http://localhost:3000"
echo "- Debug panel: http://localhost:3000/debug-fcm-simple.html"
echo "- FCM test: http://localhost:3000/api/test-fcm-status"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Start the server
node server.js
