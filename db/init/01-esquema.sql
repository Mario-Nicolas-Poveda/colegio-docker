CREATE TABLE IF NOT EXISTS estudiantes (
  id         SERIAL PRIMARY KEY,
  documento  VARCHAR(20)  NOT NULL UNIQUE,
  nombre     VARCHAR(80)  NOT NULL,
  apellido   VARCHAR(80)  NOT NULL,
  grado      SMALLINT     NOT NULL CHECK (grado BETWEEN 1 AND 11),
  correo     VARCHAR(120),
  creado_en  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_estudiantes_grado ON estudiantes (grado);
