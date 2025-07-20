#!/bin/bash

# Dixis API Documentation Generator

echo "📚 Dixis API Documentation Generator"
echo "===================================="

# Check if we're in the correct directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: This script must be run from the backend directory"
    exit 1
fi

# Function to check if l5-swagger is installed
check_l5_swagger() {
    if ! grep -q "darkaonline/l5-swagger" composer.json; then
        echo "⚠️  L5-Swagger package not found!"
        echo "📦 Installing L5-Swagger..."
        composer require darkaonline/l5-swagger
        
        if [ $? -eq 0 ]; then
            echo "✅ L5-Swagger installed successfully!"
            
            # Publish config
            echo "📝 Publishing L5-Swagger config..."
            php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
            
        else
            echo "❌ Failed to install L5-Swagger"
            exit 1
        fi
    fi
}

# Function to generate documentation
generate_docs() {
    echo "🔧 Generating API documentation..."
    
    # Create storage directory if it doesn't exist
    mkdir -p storage/api-docs
    
    # Generate documentation
    php artisan l5-swagger:generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Documentation generated successfully!"
        
        # Check if file exists and show info
        if [ -f "storage/api-docs/api-docs.json" ]; then
            file_size=$(wc -c < "storage/api-docs/api-docs.json")
            echo "📊 Documentation size: ${file_size} bytes"
            
            # Count endpoints
            endpoint_count=$(cat storage/api-docs/api-docs.json | jq '.paths | to_entries | map(.value | keys) | flatten | length' 2>/dev/null || echo "N/A")
            if [ "$endpoint_count" != "N/A" ]; then
                echo "🔗 Total endpoints: ${endpoint_count}"
            fi
        fi
        
        show_urls
    else
        echo "❌ Failed to generate documentation"
        echo "💡 Check your OpenAPI annotations in controllers"
        exit 1
    fi
}

# Function to show access URLs
show_urls() {
    echo ""
    echo "🌐 Access your API documentation:"
    echo "================================"
    echo "📖 Swagger UI: http://localhost:8000/api/documentation"
    echo "📄 JSON Schema: http://localhost:8000/docs/api-docs.json"
    echo ""
    echo "💡 Make sure your Laravel server is running:"
    echo "   php artisan serve"
    echo ""
}

# Function to validate OpenAPI annotations
validate_annotations() {
    echo "🔍 Validating OpenAPI annotations..."
    
    # Check for basic annotations in controllers
    annotation_files=$(find app/Http/Controllers -name "*.php" -exec grep -l "@OA\\" {} \;)
    annotation_count=$(echo "$annotation_files" | wc -l)
    
    if [ $annotation_count -gt 0 ]; then
        echo "✅ Found OpenAPI annotations in ${annotation_count} files:"
        echo "$annotation_files" | sed 's/^/   /'
    else
        echo "⚠️  No OpenAPI annotations found!"
        echo "💡 Add @OA annotations to your controllers"
        echo "💡 Example: @OA\\Get, @OA\\Post, @OA\\Schema, etc."
    fi
    echo ""
}

# Function to show examples
show_examples() {
    echo "📝 OpenAPI Annotation Examples:"
    echo "==============================="
    cat << 'EOF'

Basic Controller Method:
/**
 * @OA\Get(
 *     path="/api/v1/products",
 *     operationId="getProducts",
 *     tags={"Products"},
 *     summary="Get products list",
 *     @OA\Response(
 *         response=200,
 *         description="Products retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Product"))
 *         )
 *     )
 * )
 */

Schema Definition:
/**
 * @OA\Schema(
 *     schema="Product",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="price", type="number", format="decimal")
 * )
 */

Request Body:
/**
 * @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *         required={"name","price"},
 *         @OA\Property(property="name", type="string"),
 *         @OA\Property(property="price", type="number")
 *     )
 * )
 */

EOF
}

# Function to setup development environment
setup_dev() {
    echo "🔧 Setting up API documentation for development..."
    
    # Add to .env if not exists
    if ! grep -q "L5_SWAGGER_GENERATE_ALWAYS" .env; then
        echo "" >> .env
        echo "# API Documentation" >> .env
        echo "L5_SWAGGER_GENERATE_ALWAYS=true" >> .env
        echo "L5_SWAGGER_CONST_HOST=http://localhost:8000" >> .env
        echo "✅ Added L5-Swagger environment variables to .env"
    fi
    
    echo "🌐 Development URLs configured for localhost:8000"
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Generate documentation"
    echo "2) Validate annotations"
    echo "3) Show examples"
    echo "4) Setup development environment"
    echo "5) Install/Update L5-Swagger"
    echo "6) Show access URLs"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice: " choice
    
    case $choice in
        1)
            generate_docs
            ;;
        2)
            validate_annotations
            ;;
        3)
            show_examples
            ;;
        4)
            setup_dev
            ;;
        5)
            check_l5_swagger
            ;;
        6)
            show_urls
            ;;
        0)
            echo "Goodbye! 👋"
            exit 0
            ;;
        *)
            echo "Invalid choice!"
            ;;
    esac
}

# Parse command line arguments
case "${1:-}" in
    "generate"|"gen"|"-g")
        check_l5_swagger
        generate_docs
        ;;
    "validate"|"val"|"-v")
        validate_annotations
        ;;
    "examples"|"help"|"-h")
        show_examples
        ;;
    "setup"|"-s")
        setup_dev
        ;;
    "urls"|"-u")
        show_urls
        ;;
    *)
        check_l5_swagger
        validate_annotations
        # Show interactive menu
        while true; do
            show_menu
            echo ""
            read -p "Press Enter to continue..."
        done
        ;;
esac