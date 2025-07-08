#!/bin/bash

# Redis Setup Script for AskVerba
# This script helps setup Redis for development and production

set -e

echo "🚀 AskVerba Redis Setup"
echo "======================="

# Function to check if Redis is installed
check_redis_installed() {
    if command -v redis-server &> /dev/null; then
        echo "✅ Redis server is installed"
        redis-server --version
        return 0
    else
        echo "❌ Redis server is not installed"
        return 1
    fi
}

# Function to check if Redis is running
check_redis_running() {
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis server is running"
        return 0
    else
        echo "❌ Redis server is not running"
        return 1
    fi
}

# Function to install Redis (Ubuntu/Debian)
install_redis_ubuntu() {
    echo "📦 Installing Redis on Ubuntu/Debian..."
    sudo apt update
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
}

# Function to install Redis (macOS)
install_redis_macos() {
    echo "📦 Installing Redis on macOS..."
    if command -v brew &> /dev/null; then
        brew install redis
        brew services start redis
    else
        echo "❌ Homebrew is not installed. Please install Homebrew first."
        exit 1
    fi
}

# Function to start Redis with Docker
start_redis_docker() {
    echo "🐳 Starting Redis with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        exit 1
    fi
    
    # Stop existing Redis container if running
    docker stop askverba-redis 2>/dev/null || true
    docker rm askverba-redis 2>/dev/null || true
    
    # Start Redis container
    docker run -d \
        --name askverba-redis \
        -p 6379:6379 \
        -v askverba-redis-data:/data \
        redis:alpine \
        redis-server --appendonly yes
    
    echo "✅ Redis container started successfully"
    
    # Wait for Redis to be ready
    echo "⏳ Waiting for Redis to be ready..."
    sleep 3
    
    if check_redis_running; then
        echo "✅ Redis is ready for connections"
    else
        echo "❌ Redis failed to start properly"
        exit 1
    fi
}

# Function to test Redis connection
test_redis_connection() {
    echo "🔍 Testing Redis connection..."
    
    # Test basic connection
    if redis-cli ping; then
        echo "✅ Basic ping test passed"
    else
        echo "❌ Basic ping test failed"
        return 1
    fi
    
    # Test set/get operations
    redis-cli set test-key "test-value" > /dev/null
    if [ "$(redis-cli get test-key)" = "test-value" ]; then
        echo "✅ Set/Get operations working"
        redis-cli del test-key > /dev/null
    else
        echo "❌ Set/Get operations failed"
        return 1
    fi
    
    # Test expiration
    redis-cli setex test-ttl 1 "expires" > /dev/null
    sleep 2
    if [ "$(redis-cli get test-ttl)" = "" ]; then
        echo "✅ TTL/Expiration working"
    else
        echo "❌ TTL/Expiration failed"
        return 1
    fi
    
    echo "✅ All Redis tests passed!"
}

# Function to show Redis info
show_redis_info() {
    echo "📊 Redis Information:"
    echo "===================="
    redis-cli info server | grep -E "redis_version|os|arch|process_id|uptime_in_seconds"
    echo ""
    redis-cli info memory | grep -E "used_memory_human|used_memory_peak_human"
    echo ""
    redis-cli info clients | grep -E "connected_clients|blocked_clients"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1. Check Redis status"
    echo "2. Install Redis (Ubuntu/Debian)"
    echo "3. Install Redis (macOS)"
    echo "4. Start Redis with Docker"
    echo "5. Test Redis connection"
    echo "6. Show Redis info"
    echo "7. Stop Redis (Docker)"
    echo "8. Exit"
    echo ""
}

# Function to stop Redis Docker container
stop_redis_docker() {
    echo "🛑 Stopping Redis Docker container..."
    docker stop askverba-redis 2>/dev/null || echo "Container not running"
    docker rm askverba-redis 2>/dev/null || echo "Container not found"
    echo "✅ Redis container stopped"
}

# Main script logic
main() {
    while true; do
        show_menu
        read -p "Enter your choice (1-8): " choice
        
        case $choice in
            1)
                echo "🔍 Checking Redis status..."
                check_redis_installed
                check_redis_running
                ;;
            2)
                install_redis_ubuntu
                ;;
            3)
                install_redis_macos
                ;;
            4)
                start_redis_docker
                ;;
            5)
                test_redis_connection
                ;;
            6)
                show_redis_info
                ;;
            7)
                stop_redis_docker
                ;;
            8)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please choose 1-8."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Check if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
