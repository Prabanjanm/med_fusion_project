from app.db.database import AsyncSessionLocal


async def get_db():
    """
    Dependency to get async DB session.
    """
    async with AsyncSessionLocal() as session:
        yield session
