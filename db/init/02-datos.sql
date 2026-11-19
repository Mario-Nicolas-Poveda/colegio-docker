INSERT INTO estudiantes (documento, nombre, apellido, grado, correo) VALUES
  ('1001', 'Ana',       'Martínez',  5,  'ana.martinez@colegio.edu.co'),
  ('1002', 'Carlos',    'Gómez',     5,  'carlos.gomez@colegio.edu.co'),
  ('1003', 'Lucía',     'Rodríguez', 7,  'lucia.rodriguez@colegio.edu.co'),
  ('1004', 'Mateo',     'Pérez',     7,  'mateo.perez@colegio.edu.co'),
  ('1005', 'Valentina', 'Díaz',      9,  'valentina.diaz@colegio.edu.co'),
  ('1006', 'Samuel',    'Torres',    9,  'samuel.torres@colegio.edu.co'),
  ('1007', 'Isabella',  'Ramírez',   11, 'isabella.ramirez@colegio.edu.co'),
  ('1008', 'Andrés',    'Vargas',    11, 'andres.vargas@colegio.edu.co')
ON CONFLICT (documento) DO NOTHING;
