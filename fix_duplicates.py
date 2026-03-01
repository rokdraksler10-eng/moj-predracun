#!/usr/bin/env python3
"""
Remove duplicate materials from database
Keeps the first occurrence, deletes duplicates
"""

import json
import requests
import time

def remove_duplicate_materials():
    # Wait for server to be ready
    print("Waiting for server...")
    time.sleep(2)
    
    # Get all materials
    try:
        res = requests.get('http://localhost:3456/api/materials', timeout=5)
    except requests.exceptions.ConnectionError:
        print("Server not ready, waiting more...")
        time.sleep(3)
        res = requests.get('http://localhost:3456/api/materials', timeout=5)
    
    if not res.ok:
        print("Error fetching materials")
        return
    
    materials = res.json()
    print(f"Total materials: {len(materials)}")
    
    # Find duplicates
    seen = {}
    duplicates = []
    
    for material in materials:
        key = f"{material['name']}|{material['category']}"
        if key in seen:
            duplicates.append(material['id'])
            print(f"Duplicate found: {material['name']} (ID: {material['id']}) - original ID: {seen[key]}")
        else:
            seen[key] = material['id']
    
    if not duplicates:
        print("No duplicates found!")
        return
    
    print(f"\nFound {len(duplicates)} duplicates")
    print(f"Unique materials: {len(seen)}")
    
    # Delete duplicates
    print("\nDeleting duplicates...")
    for dup_id in duplicates:
        try:
            res = requests.delete(f'http://localhost:3456/api/materials/{dup_id}')
            if res.ok:
                print(f"  ✅ Deleted ID {dup_id}")
            else:
                print(f"  ❌ Failed to delete ID {dup_id}: {res.status_code}")
        except Exception as e:
            print(f"  ❌ Error deleting ID {dup_id}: {e}")
    
    # Verify
    res = requests.get('http://localhost:3456/api/materials')
    remaining = res.json()
    print(f"\n✅ Done! Remaining materials: {len(remaining)}")

if __name__ == '__main__':
    remove_duplicate_materials()
