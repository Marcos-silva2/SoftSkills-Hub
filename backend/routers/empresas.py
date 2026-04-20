from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/empresas", tags=["Empresas"])


@router.get("", response_model=list[schemas.EmpresaOut], summary="Lista todas as empresas parceiras")
def listar_empresas(db: Session = Depends(get_db)):
    return db.query(models.Empresa).order_by(models.Empresa.nome).all()
