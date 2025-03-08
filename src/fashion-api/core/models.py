"""Database models"""

from sqlalchemy import Column, Integer, String
from core.database import Base


class ClothingItem(Base):
    """Clothing item model"""

    __tablename__ = "clothing_items"

    id = Column(Integer, primary_key=True, index=True)
    gender = Column(String)
    masterCategory = Column(String)
    subCategory = Column(String)
    articleType = Column(String)
    baseColour = Column(String)
    season = Column(String)
    usage = Column(String)
    productDisplayName = Column(String)
