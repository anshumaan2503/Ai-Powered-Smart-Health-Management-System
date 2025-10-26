#!/usr/bin/env python3
"""
Simple test for patient import date handling
"""

from datetime import datetime, date
import csv
import io

def test_date_conversion():
    """Test the date conversion logic"""
    
    test_dates = [
        "23-09-1975",  # DD-MM-YYYY
        "1975-09-23",  # YYYY-MM-DD
        "09/23/1975",  # MM/DD/YYYY
        "23/09/1975",  # DD/MM/YYYY
        "invalid-date"  # Invalid format
    ]
    
    date_formats = [
        '%d-%m-%Y',  # 23-09-1975
        '%Y-%m-%d',  # 1975-09-23
        '%m/%d/%Y',  # 09/23/1975
        '%d/%m/%Y',  # 23/09/1975
        '%Y/%m/%d',  # 1975/09/23
    ]
    
    for test_date in test_dates:
        print(f"\nTesting date: {test_date}")
        
        parsed_date = None
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(test_date, fmt)
                print(f"  ✅ Parsed with format {fmt}: {parsed_date}")
                break
            except ValueError:
                continue
        
        if parsed_date:
            date_obj = parsed_date.date()
            print(f"  📅 Final date object: {date_obj} (type: {type(date_obj)})")
        else:
            date_obj = date(1990, 1, 1)
            print(f"  ❌ Failed to parse, using default: {date_obj}")

def test_csv_parsing():
    """Test CSV parsing with sample data"""
    
    csv_content = """first_name,last_name,date_of_birth,gender,phone,email
John,Doe,15-01-1990,Male,9876543210,john@example.com
Jane,Smith,1985-12-25,Female,9876543211,jane@example.com"""
    
    print("\n" + "="*50)
    print("Testing CSV parsing:")
    print("="*50)
    
    stream = io.StringIO(csv_content, newline=None)
    csv_input = csv.DictReader(stream)
    
    for row_num, row in enumerate(csv_input, start=2):
        print(f"\nRow {row_num}: {row}")
        
        # Test date conversion
        date_of_birth = row.get('date_of_birth', '').strip()
        print(f"  Raw date: {date_of_birth}")
        
        if date_of_birth:
            date_formats = [
                '%d-%m-%Y',  # 15-01-1990
                '%Y-%m-%d',  # 1985-12-25
                '%m/%d/%Y',  # 01/15/1990
                '%d/%m/%Y',  # 15/01/1990
            ]
            
            parsed_date = None
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(date_of_birth, fmt)
                    break
                except ValueError:
                    continue
            
            if parsed_date:
                date_obj = parsed_date.date()
                print(f"  ✅ Converted to: {date_obj} (type: {type(date_obj)})")
            else:
                date_obj = date(1990, 1, 1)
                print(f"  ❌ Failed, using default: {date_obj}")

if __name__ == '__main__':
    print("🧪 Testing Patient Import Date Conversion")
    print("="*50)
    
    test_date_conversion()
    test_csv_parsing()
    
    print("\n✅ Date conversion tests completed!")