#!/bin/bash

# Set the path to the .env and environment.ts files
ENV_FILE=".env"
ENVIRONMENT_FILE="src/environments/environment.ts"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Check if environment.ts file exists
if [ ! -f "$ENVIRONMENT_FILE" ]; then
    echo "Error: environment.ts file not found!"
    exit 1
fi

# Read the .env file line by line
while IFS='=' read -r key value || [[ -n "$key" ]]; do
    # Remove quotes and trim spaces
    key=$(echo "$key" | tr -d ' ')
    value=$(echo "$value" | tr -d ' ' | tr -d '"')

    # Skip empty lines or comments
    if [[ -z "$key" || "$key" == \#* ]]; then
        continue
    fi

    # Escape special characters for sed
    value_escaped=$(printf '%s\n' "$value" | sed -e 's/[\/&]/\\&/g')

    # Replace the value in environment.ts (assuming key is already defined)
    sed -i '' "s/\($key: \).*/\1\"$value_escaped\",/" "$ENVIRONMENT_FILE"

done < "$ENV_FILE"

echo "✅ Environment variables updated in $ENVIRONMENT_FILE"
