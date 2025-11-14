# Proyecto de Mallas Curriculares (SchoIA+)

Esta es la aplicación frontend del proyecto, desarrollada con Next.js y lista para desplegarse con Docker.

## Requisitos Previos

* [Git](https://git-scm.com/downloads)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine en Linux)

## Guía de Instalación Local

Gracias a Docker Compose, la instalación es muy sencilla.

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL_DE_TU_REPO_AQUI]
    ```

2.  **Acceder a la carpeta:**
    ```bash
    cd schoia_construccion_y_evolucion
    ```

3.  **Construir y ejecutar el contenedor:**
    Este comando leerá el `docker-compose.yml`, construirá la imagen y la ejecutará en segundo plano.
    ```bash
    docker-compose up -d --build
    ```

4.  **Acceder a la aplicación:**
    Una vez que termine, abre tu navegador y visita:
    [**http://localhost:9002**](http://localhost:9002)

---

### Detener la aplicación

Para detener el contenedor, ejecuta:
```bash
docker-compose down
```