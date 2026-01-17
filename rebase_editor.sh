#!/bin/bash
# Reorder and fixup commits to remove frontend.zip

# Original content is in $1
# We want to move 'chore: remove accidental frontend.zip' to be a fixup of 'feat: added email notifications'

# Read the file
CONTENT=$(cat "$1")

# Extract the lines
SHA_ADD=$(echo "$CONTENT" | grep "feat: added email notifications" | awk '{print $2}')
SHA_REMOVE=$(echo "$CONTENT" | grep "chore: remove accidental frontend.zip" | awk '{print $2}')

if [ -z "$SHA_ADD" ] || [ -z "$SHA_REMOVE" ]; then
    echo "Could not find expected commits. Aborting."
    echo "$CONTENT" # Dump content for debug
    exit 1
fi

# Construct new content
# 1. The add commit
echo "pick $SHA_ADD feat: added email notifications and refined payment flow" > "$1"
# 2. The remove commit as fixup
echo "fixup $SHA_REMOVE chore: remove accidental frontend.zip and fix gitignore" >> "$1"
# 3. All other lines that are NOT the add or remove commit
echo "$CONTENT" | grep -v "$SHA_ADD" | grep -v "$SHA_REMOVE" | grep "^pick" >> "$1"

echo "Modified rebase plan:"
cat "$1"
