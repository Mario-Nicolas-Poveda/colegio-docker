# Secretos

Cree aquí `db_password.txt` con la contraseña de PostgreSQL, **sin salto de línea final**:

```sh
printf "Colegio_Segura_2026" > secrets/db_password.txt
```

Los archivos `secrets/*.txt` están en `.gitignore`: nunca deben llegar al repositorio.
