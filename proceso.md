===========================================================================================================

### **PRIMERA PARTE: CREANDO LA PAGINA: BACKEND Y FRONTEND**

===========================================================================================================



1\) tener las bases

2\) consturir backend

3)tener entorno virtual y hacer cierta sejecicones desde backend o frontend segun corresponda

4\) construir frontend, instalas node.js y en powershell "npm install", luego en la misma temrinal dentro de vs code correr " npx tailwindcss init -p"

5\) para ejectutar, hacerlo desde backend uvicorn main:app --reload --port 8000 y luego en frontend npm run dev

6\) tuve errores en la venta de npm run dev, pues en page.js no reocnocia los path de components> para ello cree un archviso jsconfig.json y le coloque lo siguiente (lo cree en la raiz, frontend, donde esta packges.json):

{

  "compilerOptions": {

    "baseUrl": ".",

    "paths": {

      "@/\*": \["./\*"]

    }

  }

}

7\) correr nuveamnete npm run dev

8\) me dio error en la linea 8 del page.js, significa que no tenia instaaldo la libreria react icons, hay que instalarlos desde  la terminal:

npm install react-icons

9\) me dio otro error despues, sobre globals.css, error proque desde layout intentaba importar globals.css en lugar de global.css, error de nombre (globals no se llamaba, era global)

10\) esto soluciono el error y ya carga una pagina con la estructura, vacia de datos, pero la estructura del dashboard.



===========================================================================================================

### **SEGUNDA PARTE: DANDOLE FORMA AL DASHBOARD**

===========================================================================================================

1. df tenia nan que daban error en backend, corregir manteniendo solo ciertas columnas
2. df nuevo debe reempalzarse en \\backend\\data







Para iniciar de neuvo cuando se apago el computador o se cerro vs code>

1. activar el entorno virtual:

.\\.venv\\Scripts\\Activate.ps1

2\. Activar el backend

uvicorn main:app --reload

3\. Activar el frontend

npm run dev









------Grafico de barras----------

npm install rechart

npm install lucide-react



