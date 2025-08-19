
# Set Heroku config vars from local .env file
# Usage: ./heroku-set-env.sh <heroku-app-name> [.env file]

set -e

HEROKU_APP_NAME=$1
ENV_FILE=${2:-.env.local}

if [ -z "$HEROKU_APP_NAME" ]; then
  echo "Error: Heroku app name is required."
  echo "Usage: $0 <heroku-app-name> [.env file]"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file '$ENV_FILE' not found."
  exit 1
fi

echo "Setting config vars on Heroku app: $HEROKU_APP_NAME using env file: $ENV_FILE"

# Read .env file and export variables
set -o allexport
source "$ENV_FILE"
set +o allexport

# Iterate over variables and set on Heroku
echo "Setting variables..."
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ "$key" =~ ^# ]] || [ -z "$key" ]; then
    continue
  fi
  echo " - $key"
  heroku config:set "$key=$value" --app "$HEROKU_APP_NAME"
done < <(grep -v '^#' "$ENV_FILE" | grep -v '^$')

echo "All variables have been set successfully."
