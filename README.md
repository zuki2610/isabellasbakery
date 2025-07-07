🍰 Isabella's Bakery
Una página web temática dedicada a Isabella, una pastelera apasionada por crear dulces que alegran corazones.
Este proyecto utiliza SASS como preprocesador CSS siguiendo el patrón 7-1, la metodología BEM y buenas prácticas de diseño responsivo.
![image](https://github.com/user-attachments/assets/b0057602-c6d8-40c4-9de0-078ecf623396)

📂 Estructura del Proyecto
bash
Copiar
Editar
isabellasbakery/
├── css/                # CSS compilado
├── html/               # Contiene index.html e imágenes/videos
├── sass/               # Código fuente SASS
│   ├── abstracts/      # Variables, mixins, funciones, colores
│   ├── base/           # Reset, tipografía
│   ├── components/     # Buttons, cards
│   ├── layout/         # Header, footer, main, products
│   └── style.scss      # Archivo principal que importa todo
├── package.json        # Configuración de dependencias y scripts
🔧 Tecnologías
HTML5 para la estructura de la página.

SASS (SCSS) como preprocesador de CSS.

Metodología 7-1 para organizar los estilos.

BEM (Block Element Modifier) para las clases CSS.

Node.js + npm + sass para compilar los estilos.

Responsive Design con Flexbox.

🚀 Cómo ejecutar el proyecto
Instalar dependencias

bash
Copiar
Editar
npm install
Compilar el SASS en tiempo real

bash
Copiar
Editar
npm run sass
Abrir el proyecto

Abre el archivo html/index.html en tu navegador.

🎨 Características de la Interfaz
✔️ Header con logo animado (GIF) y navegación.
✔️ Sección principal con video de presentación.
✔️ Cards de productos con imágenes, descripciones y botones "Agregar al carrito".
✔️ Footer con enlaces a redes sociales.
✔️ Paleta de colores elegante en tonos rose gold.
✔️ Estilos modulados, reutilizables y responsivos.

✅ Organización de SASS (Patrón 7-1)
abstracts/: variables, mixins, funciones, colores.

base/: reset CSS y tipografía.

components/: botones y cards.

layout/: header, footer, main y sección de productos.

