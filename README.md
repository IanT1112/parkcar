# ParkCar

### Smart Parking Management powered by Computer Vision

ParkCar es una aplicación **full-stack de gestión de estacionamientos** que utiliza visión por computadora para automatizar el registro de vehículos y conectar esa detección con todo el flujo operativo de un estacionamiento.

La idea es sencilla: en lugar de registrar manualmente cada vehículo, ParkCar permite utilizar una cámara o cargar una imagen para detectar el vehículo, reconocer su matrícula y registrar automáticamente su ingreso.

A partir de ahí, el sistema controla su permanencia hasta completar el proceso de salida y pago.

---

## ¿Qué problema resuelve?

En muchos estacionamientos pequeños y medianos, el registro de vehículos, horarios de entrada, tarifas y pagos continúa dependiendo de procesos manuales.

ParkCar explora una alternativa:

**usar Computer Vision como punto de entrada a un sistema completo de gestión.**

El flujo funciona de esta manera:

**Vehículo → Detección con IA → Registro de entrada → Control de permanencia → Salida → Cálculo de tarifa → Pago**

El objetivo del proyecto no fue únicamente construir un detector de placas, sino integrar IA dentro de una aplicación con **lógica de negocio real**.

---

## ¿Qué puede hacer ParkCar?

### 📷 Reconocimiento inteligente

El usuario puede utilizar la cámara de su dispositivo o cargar una imagen.

El backend procesa la imagen para identificar:

- Vehículo
- Matrícula
- Color
- Tipo de vehículo
- Confianza de la detección

Para reducir registros producidos por lecturas inestables, el modo cámara utiliza múltiples detecciones antes de confirmar una matrícula.

### Control de entradas y salidas

Cuando ParkCar confirma un vehículo, crea automáticamente una estancia y registra su hora de entrada.

Desde ese momento el sistema puede controlar cuánto tiempo lleva estacionado.

Al registrar su salida se calculan automáticamente:

- Hora de salida
- Tiempo total de permanencia
- Tarifa correspondiente
- Monto a pagar

### Tarifas y pagos

Cada estacionamiento puede configurar su propia modalidad de cobro.

ParkCar soporta tarifas:

- Por minuto
- Por hora
- Por hora iniciada
- Con tiempo de tolerancia
- Con tarifa mínima

Las estancias finalizadas pasan posteriormente al módulo de pagos, donde puede controlarse su estado.

### Panel administrativo

El sistema cuenta con un dashboard desde el cual se puede consultar la operación del estacionamiento:

- Vehículos actualmente dentro
- Movimientos recientes
- Entradas y salidas
- Tiempo de permanencia
- Ingresos
- Pagos
- Tarifas

---

## Computer Vision

Una de las partes principales de ParkCar es su pipeline de procesamiento de imágenes.

El backend fue desarrollado en **Python + FastAPI** e integra diferentes herramientas de visión por computadora.

**YOLO** se utiliza para detectar vehículos, un modelo especializado localiza la matrícula y **EasyOCR** procesa los caracteres encontrados.

El resultado obtenido por la IA posteriormente se conecta con la lógica de negocio y la base de datos.

Esto permite pasar de:

> “La IA detectó una placa”

a:

> “El vehículo ingresó al estacionamiento, tiene una estancia activa y su tiempo está siendo contabilizado”.

---

## Autenticación y seguridad

ParkCar utiliza **Supabase Auth** para autenticación.

Cada cuenta funciona como un entorno independiente para administrar un estacionamiento y sus datos están asociados al usuario autenticado.

Además, implementé **Row Level Security (RLS)** sobre PostgreSQL para restringir el acceso a los datos correspondientes a cada cuenta.

De esta forma, vehículos, estancias, tarifas y demás información permanecen separados entre usuarios.

---

## Tech Stack

**Frontend**

`React` · `Vite` · `JavaScript` · `CSS` · `React Router`

**Backend**

`Python` · `FastAPI` · `Uvicorn`

**AI / Computer Vision**

`YOLO` · `EasyOCR` · `License Plate Detection`

**Database & Authentication**

`Supabase` · `PostgreSQL` · `Supabase Auth` · `Row Level Security`

**Cloud & Development**

`Git` · `GitHub` · `Vercel` · `Railway`

---

## Deployment

ParkCar está desplegado utilizando servicios cloud separados para cada componente.

El **frontend React está desplegado en Vercel**, mientras que el **backend FastAPI y el procesamiento de Computer Vision se ejecutan en Railway**.

Supabase proporciona la infraestructura de autenticación y PostgreSQL.

El proyecto utiliza Git y GitHub para control de versiones y como parte del flujo de deployment.

---

## Lo que exploré construyendo ParkCar

ParkCar nació como un proyecto personal para llevar Computer Vision más allá de una demostración aislada y utilizarla como parte de un producto funcional.

Durante su desarrollo trabajé con:

- Arquitectura frontend/backend
- Diseño y consumo de APIs
- Procesamiento de imágenes
- Object Detection
- OCR
- Modelado de bases de datos
- Autenticación y autorización
- Row Level Security
- Lógica de negocio
- Gestión de estados y sesiones
- Git y control de versiones
- Deployment de aplicaciones full-stack

El resultado es un **MVP funcional** que combina desarrollo de software, inteligencia artificial y lógica de negocio dentro de una misma aplicación.

---

## Próximos pasos

ParkCar continúa siendo un proyecto en evolución.

Algunas de las mejoras que estoy explorando incluyen aumentar la precisión del reconocimiento de matrículas, optimizar el procesamiento de imágenes, incorporar reportes administrativos y ampliar las funcionalidades necesarias para acercarlo a un escenario de operación real.

---

## Autor

**Ian Tapia**

Estudiante de Ingeniería de Sistemas e Inteligencia Artificial.

Interesado en construir productos donde **software, datos e inteligencia artificial** puedan resolver problemas reales.
