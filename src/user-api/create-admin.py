#!/usr/bin/env python3
import os
import sys
import re
import getpass
from dotenv import load_dotenv

# --- Important: Import necessary components from your main FastAPI app file ---
# Adjust the import path if 'main.py' is in a different directory relative to this script
try:
    # Assuming main.py is in the same directory or python path includes it
    from main import (
        Administrator, Base, engine, SessionLocal, pwd_context, User # Import User too if needed elsewhere
    )
except ImportError as e:
    print(f"Error: Could not import necessary components from main.py.")
    print(f"Ensure main.py is in the Python path and does not run server code on import.")
    print(f"Details: {e}")
    sys.exit(1)
# --- End of imports from main.py ---

load_dotenv() # Load environment variables from .env file

# Simple regex for email validation (similar to common checks)
EMAIL_REGEX = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

def ask_question(question: str, hidden: bool = False) -> str:
    """Prompts the user for input, hiding it if requested."""
    while True:
        try:
            if hidden:
                answer = getpass.getpass(question)
            else:
                answer = input(question)

            trimmed_answer = answer.strip()
            if trimmed_answer: # Ensure input is not just whitespace
                 return trimmed_answer
            else:
                 print("Input cannot be empty. Please try again.")
        except EOFError:
             print("\nOperation cancelled.")
             sys.exit(1)


async def main():
    db = None # Initialize db to None for finally block
    try:
        print("\nAdmin Account Creation Utility\n")

        # Establish database connection using SessionLocal from main.py
        db = SessionLocal()
        print("Attempting to connect to database...")
        # Test connection by querying (SQLAlchemy connects lazily)
        db.query(Administrator).first()
        print("Connected to database successfully.")

        # Ensure the table exists (optional but safe)
        # This should ideally be managed by migrations or the main app startup
        # Base.metadata.create_all(bind=engine)
        # print("Ensured Administrator table exists.")

        # --- Get User Input ---
        username = ask_question("Enter username (3-255 chars): ")
        if not (3 <= len(username) <= 255):
            raise ValueError("Username must be between 3 and 255 characters")

        email = ask_question("Enter email: ")
        if not re.match(EMAIL_REGEX, email):
            raise ValueError("Invalid email format")

        # Use getpass for password input
        password = ask_question("Enter password (min 8 chars): ", hidden=True)
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")

        confirm_password = ask_question("Confirm password: ", hidden=True)
        if password != confirm_password:
            raise ValueError("Passwords do not match")

        security_question = ask_question("Enter security question (min 10 chars): ")
        if len(security_question) < 10:
            raise ValueError("Security question must be at least 10 characters")

        security_answer = ask_question("Enter answer to security question (min 3 chars): ")
        if len(security_answer) < 3:
             raise ValueError("Security answer must be at least 3 characters")

        # --- Hashing ---
        # Use the pwd_context imported from main.py for consistency
        print("\nHashing credentials...")
        password_hash = pwd_context.hash(password)
        security_answer_hash = pwd_context.hash(security_answer)
        print("Hashing complete.")

        # --- Database Operation ---
        print("Creating admin record...")
        new_admin = Administrator(
            username=username,
            email=email,
            password_hash=password_hash,
            security_question=security_question,
            security_answer_hash=security_answer_hash,
        )

        # Check for existing user/email before adding
        existing_user = db.query(Administrator).filter(
            (Administrator.username == username) | (Administrator.email == email)
        ).first()
        if existing_user:
             if existing_user.username == username:
                  raise ValueError(f"Username '{username}' already exists.")
             else:
                  raise ValueError(f"Email '{email}' already exists.")


        db.add(new_admin)
        db.commit()

        print("\nAdmin account created successfully!")

    except ValueError as ve:
         print(f"\nInput Error: {ve}")
         sys.exit(1)
    except ImportError:
         # Error already printed during import
         sys.exit(1)
    except Exception as e:
        # Catch other potential errors (database connection, integrity errors)
        if db:
            db.rollback() # Rollback transaction if commit failed
        print(f"\nAn unexpected error occurred: {e}")
        # Add more specific checks for SQLAlchemy errors if needed
        # from sqlalchemy.exc import IntegrityError
        # if isinstance(e, IntegrityError):
        #     print("Database integrity error (maybe duplicate username/email?).")
        sys.exit(1)
    finally:
        if db:
            db.close()
            # print("Database connection closed.")

if __name__ == "__main__":
    import asyncio
    # If main needs to be async because of potential async setup in main.py
    # asyncio.run(main())
    # If main can be synchronous (as it likely is here):
    asyncio.run(main()) # Still use asyncio.run if main is async
    # If main function is NOT async, just call main() directly:
    # main()
    # --> Based on your original code, the main operations (DB, input) are sync,
    # --> but let's keep asyncio.run in case future imports make it necessary.
    # --> If you get errors related to event loops, make main() synchronous
    # --> and call it directly: def main(): ... ; if __name__ == "__main__": main()
