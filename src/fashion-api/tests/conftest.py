import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base, get_db
from fastapi.testclient import TestClient
from main import app  # Import your FastAPI app
from core.config import Settings


# Use a separate database for testing
TEST_DATABASE_URL = "sqlite:///./test.db"

#  Configure the test settings to use the test database
class TestSettings(Settings):
    DATABASE_URL: str = TEST_DATABASE_URL

@pytest.fixture(scope="session")
def test_settings():
    return TestSettings()

@pytest.fixture(scope="session")
def db_engine(test_settings):
    engine = create_engine(test_settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db(db_engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(db, test_settings):
    # Override the get_db dependency
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

     #  Override settings in the app
    app.settings = test_settings
    with TestClient(app) as c:
        yield c

    # Clean up after each test
    app.dependency_overrides.clear()
