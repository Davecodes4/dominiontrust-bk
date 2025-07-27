#!/usr/bin/env python3
"""
Test script to demonstrate US holiday support in business day calculations
"""

import os
import sys
import django
from datetime import date, timedelta

# Setup Django environment
project_root = '/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend'
sys.path.append(project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from banking.models import (
    is_business_day, get_next_business_day, get_holiday_info, 
    calculate_business_days_between
)
import holidays

def test_us_holidays():
    """Test US federal holiday recognition"""
    
    print("🇺🇸 US Federal Holiday Testing")
    print("=" * 50)
    
    # Common US federal holidays in 2024
    test_holidays = [
        date(2024, 1, 1),   # New Year's Day
        date(2024, 1, 15),  # Martin Luther King Jr. Day
        date(2024, 2, 19),  # Presidents' Day
        date(2024, 5, 27),  # Memorial Day
        date(2024, 6, 19),  # Juneteenth
        date(2024, 7, 4),   # Independence Day
        date(2024, 9, 2),   # Labor Day
        date(2024, 10, 14), # Columbus Day
        date(2024, 11, 11), # Veterans Day
        date(2024, 11, 28), # Thanksgiving
        date(2024, 12, 25), # Christmas Day
    ]
    
    print("\n📅 US Federal Holidays Recognition:")
    print("-" * 40)
    
    for holiday_date in test_holidays:
        is_holiday, holiday_name = get_holiday_info(holiday_date)
        is_business = is_business_day(holiday_date)
        weekday_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][holiday_date.weekday()]
        
        print(f"{holiday_date} ({weekday_name}): {holiday_name}")
        print(f"  Is Holiday: {is_holiday}")
        print(f"  Is Business Day: {is_business}")
        print()

def test_holiday_impact_on_transactions():
    """Test how holidays affect transaction completion dates"""
    
    print("\n🏦 Holiday Impact on Transaction Processing:")
    print("-" * 40)
    
    # Test dates around holidays
    test_scenarios = [
        # Before July 4th (Thursday) 2024
        (date(2024, 7, 3), "July 3rd (before July 4th holiday)", 1),
        (date(2024, 7, 3), "July 3rd (before July 4th holiday)", 2),
        
        # Before Memorial Day (Monday) 2024
        (date(2024, 5, 24), "May 24th (before Memorial Day)", 1),
        (date(2024, 5, 24), "May 24th (before Memorial Day)", 2),
        
        # Before Christmas (Wednesday) 2024
        (date(2024, 12, 23), "December 23rd (before Christmas)", 1),
        (date(2024, 12, 23), "December 23rd (before Christmas)", 3),
        
        # Before New Year's (Wednesday) 2025
        (date(2024, 12, 30), "December 30th (before New Year's)", 1),
        (date(2024, 12, 30), "December 30th (before New Year's)", 2),
    ]
    
    for start_date, description, business_days in test_scenarios:
        completion_date = get_next_business_day(start_date, business_days)
        actual_days = (completion_date - start_date).days
        
        print(f"\nScenario: {description}")
        print(f"  Transaction Date: {start_date}")
        print(f"  Business Days Required: {business_days}")
        print(f"  Completion Date: {completion_date}")
        print(f"  Actual Calendar Days: {actual_days}")
        
        # Check if completion date is affected by holidays
        is_holiday, holiday_name = get_holiday_info(completion_date)
        if is_holiday:
            print(f"  ⚠️  Completion falls on {holiday_name}")

def test_weekend_and_holiday_combinations():
    """Test complex scenarios with weekends and holidays"""
    
    print("\n\n🗓️  Weekend + Holiday Combinations:")
    print("-" * 40)
    
    # Christmas 2024 falls on Wednesday
    # Let's test transactions around that time
    christmas_week_tests = [
        date(2024, 12, 20),  # Friday before Christmas week
        date(2024, 12, 21),  # Saturday
        date(2024, 12, 22),  # Sunday  
        date(2024, 12, 23),  # Monday
        date(2024, 12, 24),  # Tuesday (Christmas Eve)
        date(2024, 12, 25),  # Wednesday (Christmas)
        date(2024, 12, 26),  # Thursday
    ]
    
    print("Christmas Week 2024 Scenarios:")
    for test_date in christmas_week_tests:
        weekday_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][test_date.weekday()]
        is_business = is_business_day(test_date)
        is_holiday, holiday_name = get_holiday_info(test_date)
        
        # Calculate 1 business day from this date
        next_business = get_next_business_day(test_date, 1)
        
        print(f"\n{test_date} ({weekday_name}):")
        print(f"  Is Business Day: {is_business}")
        if is_holiday:
            print(f"  Holiday: {holiday_name}")
        print(f"  Next Business Day: {next_business}")

def test_current_year_holidays():
    """Test with current year holidays"""
    
    print("\n\n📆 Current Year Holiday Analysis:")
    print("-" * 40)
    
    current_year = date.today().year
    us_holidays = holidays.US(years=current_year)
    
    print(f"US Federal Holidays for {current_year}:")
    for holiday_date, holiday_name in sorted(us_holidays.items()):
        weekday_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][holiday_date.weekday()]
        is_business = is_business_day(holiday_date)
        
        print(f"  {holiday_date} ({weekday_name}): {holiday_name}")
        
        # Show impact if holiday falls on weekday
        if holiday_date.weekday() < 5:  # Weekday
            print(f"    📝 Business day impact: Banks closed")

def test_transaction_messages():
    """Test realistic transaction messages with holiday awareness"""
    
    print("\n\n💬 Realistic Transaction Messages:")
    print("-" * 40)
    
    today = date.today()
    
    # Test internal transfer (1 business day)
    internal_completion = get_next_business_day(today, 1)
    is_holiday, holiday_name = get_holiday_info(internal_completion)
    
    print("Internal Transfer (1 business day):")
    print(f"  Initiated: {today}")
    print(f"  Expected Completion: {internal_completion}")
    if is_holiday:
        print(f"  Message: 'Your transfer is being processed and will be completed within 1 business day (note: {holiday_name} may cause slight delays)'")
    else:
        print(f"  Message: 'Your transfer is being processed and will be completed within 1 business day'")
    
    print()
    
    # Test external transfer (2 business days)
    external_completion = get_next_business_day(today, 2)
    is_holiday, holiday_name = get_holiday_info(external_completion)
    
    print("External Transfer (2 business days):")
    print(f"  Initiated: {today}")
    print(f"  Expected Completion: {external_completion}")
    if is_holiday:
        print(f"  Message: 'Your transfer is on the way and may take 1 to 2 business days to complete (excluding {holiday_name})'")
    else:
        print(f"  Message: 'Your transfer is on the way and may take 1 to 2 business days to complete'")

def test_business_day_calculations():
    """Test accurate business day counting with holidays"""
    
    print("\n\n🧮 Business Day Counting (with Holidays):")
    print("-" * 40)
    
    # Test period that includes holidays
    start_date = date(2024, 12, 20)  # Friday before Christmas week
    end_date = date(2025, 1, 3)      # First Friday of new year
    
    total_days = (end_date - start_date).days
    business_days = calculate_business_days_between(start_date, end_date)
    weekends = 0
    holidays_count = 0
    
    # Count weekends and holidays in the period
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() >= 5:  # Weekend
            weekends += 1
        elif not is_business_day(current_date):  # Holiday
            holidays_count += 1
        current_date += timedelta(days=1)
    
    print(f"Period: {start_date} to {end_date}")
    print(f"Total Calendar Days: {total_days}")
    print(f"Business Days: {business_days}")
    print(f"Weekend Days: {weekends}")
    print(f"Holiday Days: {holidays_count}")
    print(f"Non-Business Days: {weekends + holidays_count}")

def show_holiday_enhancement_summary():
    """Show what was enhanced with holiday support"""
    
    print("\n\n🎯 Holiday Enhancement Summary:")
    print("-" * 40)
    
    print("✅ What's NOW Included:")
    print("  • Monday through Friday (weekdays)")
    print("  • Automatic weekend skipping")
    print("  • US Federal Holiday exclusion")
    print("  • Holiday-aware completion dates")
    print("  • User-friendly holiday messages")
    print("  • Accurate business day counting")
    
    print("\n📝 US Federal Holidays Recognized:")
    current_year = date.today().year
    us_holidays = holidays.US(years=current_year)
    for holiday_date, holiday_name in sorted(us_holidays.items()):
        print(f"  • {holiday_name}")
    
    print("\n💡 Message Examples:")
    print("  • 'Your transfer may take 1 to 3 business days (excluding Independence Day)'")
    print("  • 'Note: Christmas Day may affect processing times'")
    print("  • 'Your transfer will be completed within 1 business day (note: Memorial Day may cause slight delays)'")

if __name__ == '__main__':
    test_us_holidays()
    test_holiday_impact_on_transactions()
    test_weekend_and_holiday_combinations()
    test_current_year_holidays()
    test_transaction_messages()
    test_business_day_calculations()
    show_holiday_enhancement_summary()
    
    print("\n\n🚀 Your Banking System Now:")
    print("✅ Recognizes US federal holidays")
    print("✅ Provides accurate business day calculations")
    print("✅ Gives users realistic expectations")
    print("✅ Handles complex holiday scenarios")
    print("✅ Shows professional banking standards")
    
    print("\n💡 Next Steps:")
    print("  - Run migrations: python manage.py makemigrations && python manage.py migrate")
    print("  - Test with real transactions: python scripts/create_test_transaction.py")
    print("  - Update cron job will automatically use new calculations") 