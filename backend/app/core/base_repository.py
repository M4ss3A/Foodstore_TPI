from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


# repo generico
class BaseRepository(Generic[T]):
    def __init__(self, model: type[T], session: Session) -> None:
        self.model = model
        self.session = session

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()  # flush y no commit, el commit lo hace el UoW
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
