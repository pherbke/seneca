const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a user
    const user = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@trust-cv.de",
        password: "password",
      },
    });

    const user2 = await prisma.user.create({
      data: {
        firstName: "Max",
        lastName: "Mustermann",
        email: "max@trust-cv.de",
        password: "password",
      },
    });

    const tuBerlin = await prisma.company.create({
      data: {
        name: `Technical University of Berlin`,
        email: `info@tu-berlin.de`,
        logo: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 235.92 80.7" style="enable-background:new 0 0 235.92 80.7" width="146" height="50" xml:space="preserve"><style>.st1{fill:#c50e1f}</style><path id="XMLID_191_" class="st1" d="M75.81 80.7c6.28 0 10.79-1.86 14.29-4.21 3.27-2.19 5.8-4.78 7.74-8.12 2.51-4.32 2.78-8.33 2.99-10.66 0-.02 4.67-48.4 4.67-48.4H82.7c-.01 0-6.9 71.39-6.89 71.39z"/><path id="XMLID_190_" class="st1" d="m53.86 22.73-3.45 35.8c-.58 7.83 2.36 11.85 4.18 13.97 3.34 3.87 9.47 6.91 16.56 8.18l6.6-68.51c.21-3.25-.73-6.09-2.9-8.57C72.32.71 68.57.05 67.02.05L10.46.06C6.28.06 0 4.11 0 11.11c0 8.65 7.69 11.62 10.34 11.62 1.35.01 43.52 0 43.52 0z"/><path id="XMLID_189_" class="st1" d="m44.53 71.41 4.24-44.02-22.84-.05s-3.72 38.32-4.26 44.02l22.86.05z"/><g id="XMLID_127_"><path id="XMLID_187_" class="st1" d="M119.73 11.16v11.67h-2.18V11.16h-3.7V9.31h9.61v1.84h-3.73z"/><path id="XMLID_185_" class="st1" d="M126.36 22.83V9.31h7.13v1.82h-4.95v3.84h4.7v1.78h-4.7v4.2h4.95v1.86h-7.13z"/><path id="XMLID_183_" class="st1" d="M143.02 22.99c-4.52 0-6.19-2.92-6.19-6.53 0-4.2 2.12-7.27 6.67-7.27 1 0 2.04.16 2.98.38l-.24 2c-.98-.3-1.94-.46-2.92-.46-2.82 0-4.1 2.16-4.1 4.98 0 3.14 1.34 4.92 4.28 4.92.92 0 2.1-.26 2.84-.62l.26 1.94c-1.02.42-2.28.66-3.58.66z"/><path id="XMLID_181_" class="st1" d="M158.99 22.83v-6.07h-6.39v6.07h-2.18V9.31h2.18v5.59h6.39V9.31h2.16v13.51h-2.16z"/><path id="XMLID_179_" class="st1" d="m174.01 22.83-4.62-7.69c-.6-.98-1.08-1.94-1.5-2.84.08 1.32.12 4.06.12 5.99v4.54h-2.12V9.31h2.86l4.46 7.37c.6 1 1.14 2.08 1.64 3.06-.08-1.54-.14-4.44-.14-6.43v-4h2.12v13.51h-2.82z"/><path id="XMLID_177_" class="st1" d="M181.56 22.83V9.31h2.18v13.51h-2.18z"/><path id="XMLID_175_" class="st1" d="M190.47 23.03c-.98 0-1.94-.12-2.72-.32l.12-2.06c.76.28 1.82.5 2.8.5 1.48 0 2.68-.62 2.68-2.08 0-2.84-5.91-1.64-5.91-6.01 0-2.32 1.82-3.94 4.96-3.94.8 0 1.62.1 2.44.24l-.12 1.94c-.78-.24-1.64-.38-2.44-.38-1.68 0-2.54.78-2.54 1.9 0 2.7 5.9 1.7 5.9 5.93.01 2.48-1.95 4.28-5.17 4.28z"/><path id="XMLID_173_" class="st1" d="M204.85 22.99c-4.52 0-6.19-2.92-6.19-6.53 0-4.2 2.12-7.27 6.67-7.27 1 0 2.04.16 2.98.38l-.24 2c-.98-.3-1.94-.46-2.92-.46-2.82 0-4.1 2.16-4.1 4.98 0 3.14 1.34 4.92 4.28 4.92.92 0 2.1-.26 2.84-.62l.26 1.94c-1.02.42-2.28.66-3.58.66z"/><path id="XMLID_171_" class="st1" d="M220.82 22.83v-6.07h-6.39v6.07h-2.18V9.31h2.18v5.59h6.39V9.31h2.16v13.51h-2.16z"/><path id="XMLID_169_" class="st1" d="M227.71 22.83V9.31h7.13v1.82h-4.95v3.84h4.7v1.78h-4.7v4.2h4.95v1.86h-7.13z"/><path id="XMLID_167_" class="st1" d="M120.21 47.29c-4.24 0-5.15-2.32-5.15-4.8v-8.91h2.18v8.75c0 1.8.6 3.16 3.1 3.16 2.2 0 3.2-.92 3.2-3.44v-8.47h2.14v8.31c.01 3.6-1.93 5.4-5.47 5.4z"/><path id="XMLID_165_" class="st1" d="m138.25 47.09-4.62-7.69c-.6-.98-1.08-1.94-1.5-2.84.08 1.32.12 4.06.12 5.99v4.54h-2.12V33.58h2.86l4.46 7.37c.6 1 1.14 2.08 1.64 3.06-.08-1.54-.14-4.44-.14-6.43v-4h2.12v13.51h-2.82z"/><path id="XMLID_163_" class="st1" d="M145.6 47.09V33.58h2.18v13.51h-2.18z"/><path id="XMLID_161_" class="st1" d="M157.79 47.09h-2.48l-4.8-13.51h2.4l2.84 8.33c.28.78.6 1.74.86 2.74h.02c.24-.94.48-1.78.88-2.88l2.9-8.19h2.24l-4.86 13.51z"/><path id="XMLID_159_" class="st1" d="M165.38 47.09V33.58h7.13v1.82h-4.95v3.84h4.7v1.78h-4.7v4.2h4.95v1.86h-7.13z"/><path id="XMLID_156_" class="st1" d="m182.84 47.09-4.2-5.85h-.1v5.85h-2.18V33.58c.98-.06 2.1-.08 3.62-.08 2.8 0 4.72.98 4.72 3.66 0 2.16-1.62 3.54-3.82 3.78.38.48.8 1 1.14 1.44l3.56 4.7h-2.74zm-3.16-11.81c-.42 0-.82.02-1.14.04v4.28c.2.02.58.04 1.06.04 1.76 0 2.82-.9 2.82-2.24 0-1.48-.92-2.12-2.74-2.12z"/><path id="XMLID_154_" class="st1" d="M190.87 47.29c-.98 0-1.94-.12-2.72-.32l.12-2.06c.76.28 1.82.5 2.8.5 1.48 0 2.68-.62 2.68-2.08 0-2.84-5.91-1.64-5.91-6.01 0-2.32 1.82-3.94 4.96-3.94.8 0 1.62.1 2.44.24l-.12 1.94c-.78-.24-1.64-.38-2.44-.38-1.68 0-2.54.78-2.54 1.9 0 2.7 5.9 1.7 5.9 5.93.02 2.48-1.95 4.28-5.17 4.28z"/><path id="XMLID_152_" class="st1" d="M199.56 47.09V33.58h2.18v13.51h-2.18z"/><path id="XMLID_150_" class="st1" d="M210.47 35.42v11.67h-2.18V35.42h-3.7v-1.84h9.61v1.84h-3.73z"/><path id="XMLID_145_" class="st1" d="m223.91 47.09-1.04-2.98h-5.47l-1.04 2.98h-2.2L219 33.58h2.42l4.9 13.51h-2.41zm-5.69-14.67c-.68 0-1.2-.54-1.2-1.22 0-.66.52-1.2 1.2-1.2s1.22.54 1.22 1.2c0 .67-.54 1.22-1.22 1.22zm2.52 5.7c-.26-.7-.44-1.34-.6-2.08h-.04a15.9 15.9 0 0 1-.62 2.14l-1.52 4.18h4.32l-1.54-4.24zm1.43-5.7c-.68 0-1.22-.54-1.22-1.22 0-.66.54-1.2 1.22-1.2.66 0 1.2.54 1.2 1.2 0 .67-.54 1.22-1.2 1.22z"/><path id="XMLID_143_" class="st1" d="M232.2 35.42v11.67h-2.18V35.42h-3.7v-1.84h9.61v1.84h-3.73z"/><path id="XMLID_139_" class="st1" d="M118.75 71.41c-.82 0-2.18-.04-3.68-.06V57.84c1.06-.02 2.6-.06 4.24-.06 2.94 0 4.46 1.2 4.46 3.28 0 1.38-.92 2.6-2.3 3.08v.04c1.76.34 2.58 1.68 2.58 3.08 0 1.77-1.16 4.15-5.3 4.15zm.2-11.89c-.6 0-1.18.02-1.7.04v4c.36.02.7.02 1.16.02 2.02 0 3.08-.82 3.08-2.18 0-1.1-.62-1.88-2.54-1.88zm-.48 5.69c-.22 0-.92 0-1.22.02v4.3c.34.06.88.1 1.58.1 1.98 0 2.92-.96 2.92-2.32 0-1.54-1.38-2.1-3.28-2.1z"/><path id="XMLID_137_" class="st1" d="M127.72 71.35V57.84h7.13v1.82h-4.95v3.84h4.7v1.78h-4.7v4.2h4.95v1.86h-7.13z"/><path id="XMLID_134_" class="st1" d="m145.18 71.35-4.2-5.85h-.1v5.85h-2.18V57.84c.98-.06 2.1-.08 3.62-.08 2.8 0 4.72.98 4.72 3.66 0 2.16-1.62 3.54-3.82 3.78.38.48.8 1 1.14 1.44l3.56 4.7h-2.74zm-3.17-11.81c-.42 0-.82.02-1.14.04v4.28c.2.02.58.04 1.06.04 1.76 0 2.82-.9 2.82-2.24.01-1.48-.91-2.12-2.74-2.12z"/><path id="XMLID_132_" class="st1" d="M151.06 71.35V57.84h2.18v11.61h4.65v1.9h-6.83z"/><path id="XMLID_130_" class="st1" d="M160.62 71.35V57.84h2.18v13.51h-2.18z"/><path id="XMLID_128_" class="st1" d="m175.45 71.35-4.62-7.69c-.6-.98-1.08-1.94-1.5-2.84.08 1.32.12 4.06.12 5.98v4.54h-2.12v-13.5h2.86l4.46 7.37c.6 1 1.14 2.08 1.64 3.06-.08-1.54-.14-4.44-.14-6.43v-4h2.12v13.51h-2.82z"/></g></svg>`,
        password: "password",
      },
    });

    const fuBerlin = await prisma.company.create({
      data: {
        name: `Freie Universität Berlin`,
        email: `info@fu-berlin.de`,
        logo: `<svg
        id="fu-logo"
        version="1.1"
        viewBox="0 0 400 134.37576"
        x="0"
        y="0"
        style="inline-size:335px;display:block"
        sodipodi:docname="Freie Universität Berlin Logo 09.05.2024.svg"
        width="400"
        height="134.37576"
        inkscape:version="1.1.2 (0a00cf5339, 2022-02-04)"
        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">
       <sodipodi:namedview
          id="namedview85"
          pagecolor="#505050"
          bordercolor="#ffffff"
          borderopacity="1"
          inkscape:pageshadow="0"
          inkscape:pageopacity="0"
          inkscape:pagecheckerboard="1"
          showgrid="false"
          inkscape:zoom="1.4659829"
          inkscape:cx="365.625"
          inkscape:cy="155.86812"
          inkscape:window-width="1850"
          inkscape:window-height="1016"
          inkscape:window-x="0"
          inkscape:window-y="0"
          inkscape:window-maximized="1"
          inkscape:current-layer="fu-logo" />
       <defs
          id="defs65">
         <g
            id="fu-logo-elements">
           <g
              id="g8">
             <polygon
                points="156.3,43.8 100,43.8 100,87.5 75,87.5 75,25 156.3,25 "
                id="polygon2" />
             <polygon
                points="150,106.3 100,106.3 100,87.5 150,87.5 "
                id="polygon4" />
             <polygon
                points="75,162.5 50,162.5 50,112.5 75,112.5 "
                id="polygon6" />
           </g>
           <g
              id="g20">
             <path
                d="m 187.5,25 h 19.7 v 5.9 h -12.7 v 7.2 h 10.8 V 44 h -10.8 v 12.2 h -7.1 V 25 Z"
                style="d:path('M 187.5 25 H 207.2 V 30.9 H 194.5 V 38.1 H 205.3 V 44 H 194.5 V 56.2 H 187.4 V 25 Z')"
                id="path10" />
             <path
                d="m 237.7,56.3 -7.1,-12.5 c 3.3,-1.5 5.6,-4.4 5.6,-9 0,-7.4 -5.4,-9.7 -12.1,-9.7 h -11.3 v 31.3 h 7.1 V 45 h 3.9 l 6,11.2 h 7.9 z M 219.9,30.6 h 3.6 c 3.7,0 5.7,1 5.7,4.1 0,3.1 -2,4.7 -5.7,4.7 h -3.6 z"
                style="d:path('M 237.7 56.3 L 230.6 43.8 C 233.9 42.3 236.2 39.4 236.2 34.8 C 236.2 27.4 230.8 25.1 224.1 25.1 H 212.8 V 56.4 H 219.9 V 45 H 223.8 L 229.8 56.2 H 237.7 Z M 219.9 30.6 H 223.5 C 227.2 30.6 229.2 31.6 229.2 34.7 C 229.2 37.8 227.2 39.4 223.5 39.4 H 219.9 V 30.6 Z')"
                id="path12" />
             <path
                d="m 242.5,25 h 19.6 v 5.9 h -12.5 v 6.3 h 10.7 v 5.9 h -10.7 v 7.2 h 13 v 5.9 h -20.1 z"
                style="d:path('M 242.5 25 H 262.1 V 30.9 H 249.6 V 37.2 H 260.3 V 43.1 H 249.6 V 50.3 H 262.6 V 56.2 H 242.5 V 25 Z')"
                id="path14" />
             <path
                d="m 269,25 h 7.1 V 56.3 H 269 Z"
                style="d:path('M 269 25 H 276.1 V 56.3 H 269 V 25 Z')"
                id="path16" />
             <path
                d="m 283.2,25 h 19.6 v 5.9 h -12.5 v 6.3 H 301 v 5.9 h -10.7 v 7.2 h 13 v 5.9 h -20.1 z"
                style="d:path('M 283.2 25 H 302.8 V 30.9 H 290.3 V 37.2 H 301 V 43.1 H 290.3 V 50.3 H 303.3 V 56.2 H 283.2 V 25 Z')"
                id="path18" />
           </g>
           <g
              id="g48">
             <path
                d="m 427.8,72.7 c 2,0 3.4,-1.4 3.4,-3.4 0,-1.9 -1.4,-3.4 -3.4,-3.4 -2,0 -3.4,1.4 -3.4,3.4 0,2 1.4,3.4 3.4,3.4 z"
                style="d:path('M 427.8 72.7 C 429.8 72.7 431.2 71.3 431.2 69.3 C 431.2 67.4 429.8 65.9 427.8 65.9 C 425.8 65.9 424.4 67.3 424.4 69.3 C 424.4 71.3 425.8 72.7 427.8 72.7 Z')"
                id="path22" />
             <path
                d="m 417.2,72.7 c 2,0 3.4,-1.4 3.4,-3.4 0,-1.9 -1.4,-3.4 -3.4,-3.4 -2,0 -3.4,1.4 -3.4,3.4 0,2 1.4,3.4 3.4,3.4 z"
                style="d:path('M 417.2 72.7 C 419.2 72.7 420.6 71.3 420.6 69.3 C 420.6 67.4 419.2 65.9 417.2 65.9 C 415.2 65.9 413.8 67.3 413.8 69.3 C 413.8 71.3 415.2 72.7 417.2 72.7 Z')"
                id="path24" />
             <path
                d="M 187.5,91.8 V 75 h 7.1 v 17.5 c 0,6.1 1.9,8.2 5.4,8.2 3.5,0 5.5,-2.1 5.5,-8.2 V 75 h 6.8 v 16.8 c 0,10.5 -4.3,15.1 -12.3,15.1 -8.1,0 -12.5,-4.6 -12.5,-15.1 z"
                style="d:path('M 187.5 91.8 V 75 H 194.6 V 92.5 C 194.6 98.6 196.5 100.7 200 100.7 C 203.5 100.7 205.5 98.6 205.5 92.5 V 75 H 212.3 V 91.8 C 212.3 102.3 208 106.9 200 106.9 C 191.9 106.9 187.5 102.3 187.5 91.8 Z')"
                id="path26" />
             <path
                d="m 218.8,75 h 7.2 l 8.2,15.5 3.1,6.9 h 0.2 C 237.2,94.1 236.6,89.7 236.6,86 V 75 h 6.7 v 31.3 h -7.2 L 228,90.7 224.9,83.9 h -0.2 c 0.3,3.4 0.9,7.6 0.9,11.3 v 11.1 h -6.7 V 75 Z"
                style="d:path('M 218.8 75 H 226 L 234.2 90.5 L 237.3 97.4 H 237.5 C 237.2 94.1 236.6 89.7 236.6 86 V 75 H 243.3 V 106.3 H 236.1 L 228 90.7 L 224.9 83.9 H 224.7 C 225 87.3 225.6 91.5 225.6 95.2 V 106.3 H 218.9 V 75 Z')"
                id="path28" />
             <path
                d="m 250.4,75 h 7.1 v 31.3 h -7.1 z"
                style="d:path('M 250.4 75 H 257.5 V 106.3 H 250.4 V 75 Z')"
                id="path30" />
             <path
                d="m 261,75 h 7.5 l 3.8,14.6 c 0.9,3.4 1.6,6.6 2.5,10 h 0.2 c 0.9,-3.4 1.6,-6.6 2.5,-10 L 281.2,75 h 7.2 l -9.4,31.3 h -8.5 z"
                style="d:path('M 261 75 H 268.5 L 272.3 89.6 C 273.2 93 273.9 96.2 274.8 99.6 H 275 C 275.9 96.2 276.6 93 277.5 89.6 L 281.2 75 H 288.4 L 279 106.3 H 270.5 L 261 75 Z')"
                id="path32" />
             <path
                d="m 291.9,75 h 19.6 v 6 H 299 v 6.3 h 10.7 v 5.9 H 299 v 7.2 h 13 v 5.9 h -20.1 z"
                style="d:path('M 291.9 75 H 311.5 V 81 H 299 V 87.3 H 309.7 V 93.2 H 299 V 100.4 H 312 V 106.3 H 291.9 V 75 Z')"
                id="path34" />
             <path
                d="m 342.8,106.3 -7.1,-12.5 c 3.3,-1.5 5.6,-4.4 5.6,-9 0,-7.4 -5.4,-9.7 -12.1,-9.7 H 318 v 31.3 h 7.1 V 95.1 h 3.9 l 6,11.2 z M 325.1,80.7 h 3.6 c 3.7,0 5.7,1 5.7,4.1 0,3.1 -2,4.7 -5.7,4.7 h -3.6 z"
                style="d:path('M 342.8 106.3 L 335.7 93.8 C 339 92.3 341.3 89.4 341.3 84.8 C 341.3 77.4 335.9 75.1 329.2 75.1 H 318 V 106.4 H 325.1 V 95.1 H 329 L 335 106.3 H 342.8 Z M 325.1 80.7 H 328.7 C 332.4 80.7 334.4 81.7 334.4 84.8 C 334.4 87.9 332.4 89.5 328.7 89.5 H 325.1 V 80.7 Z')"
                id="path36" />
             <path
                d="m 344.9,102.4 4.1,-4.8 c 2.2,1.9 5.1,3.3 7.7,3.3 2.9,0 4.4,-1.2 4.4,-3 0,-2 -1.8,-2.6 -4.5,-3.7 l -4.1,-1.7 c -3.2,-1.3 -6.3,-4 -6.3,-8.5 0,-5.2 4.6,-9.3 11.1,-9.3 3.6,0 7.4,1.4 10.1,4.1 l -3.6,4.5 c -2.1,-1.6 -4,-2.4 -6.5,-2.4 -2.4,0 -4,1 -4,2.8 0,1.9 2,2.6 4.8,3.7 l 4,1.6 c 3.8,1.5 6.2,4.1 6.2,8.5 0,5.2 -4.3,9.7 -11.8,9.7 -4.1,-0.3 -8.4,-1.9 -11.6,-4.8 z"
                style="d:path('M 344.9 102.4 L 349 97.6 C 351.2 99.5 354.1 100.9 356.7 100.9 C 359.6 100.9 361.1 99.7 361.1 97.9 C 361.1 95.9 359.3 95.3 356.6 94.2 L 352.5 92.5 C 349.3 91.2 346.2 88.5 346.2 84 C 346.2 78.8 350.8 74.7 357.3 74.7 C 360.9 74.7 364.7 76.1 367.4 78.8 L 363.8 83.3 C 361.7 81.7 359.8 80.9 357.3 80.9 C 354.9 80.9 353.3 81.9 353.3 83.7 C 353.3 85.6 355.3 86.3 358.1 87.4 L 362.1 89 C 365.9 90.5 368.3 93.1 368.3 97.5 C 368.3 102.7 364 107.2 356.5 107.2 C 352.4 106.9 348.1 105.3 344.9 102.4 Z')"
                id="path38" />
             <path
                d="m 373.9,75 h 7.1 v 31.3 h -7.1 z"
                style="d:path('M 373.9 75 H 381 V 106.3 H 373.9 V 75 Z')"
                id="path40" />
             <path
                d="m 394.4,81 h -8.6 V 75 H 410 v 6 h -8.6 v 25.3 h -7.1 V 81 Z"
                style="d:path('M 394.4 81 H 385.8 V 75 H 410 V 81 H 401.4 V 106.3 H 394.3 V 81 Z')"
                id="path42" />
             <path
                d="m 429.2,106.3 h 7.5 L 426.9,75 h -8.5 l -9.8,31.3 h 7.2 l 1.9,-7.4 h 9.5 z m -10,-12.9 0.8,-2.9 c 0.9,-3.1 1.7,-6.8 2.5,-10.1 h 0.2 c 0.8,3.3 1.7,7 2.5,10.1 l 0.7,2.9 z"
                style="d:path('M 429.2 106.3 H 436.7 L 426.9 75 H 418.4 L 408.6 106.3 H 415.8 L 417.7 98.9 H 427.2 L 429.2 106.3 Z M 419.2 93.4 L 420 90.5 C 420.9 87.4 421.7 83.7 422.5 80.4 H 422.7 C 423.5 83.7 424.4 87.4 425.2 90.5 L 425.9 93.4 H 419.2 Z')"
                id="path44" />
             <path
                d="M 443.6,81 H 435 v -6 h 24.3 v 6 h -8.6 v 25.3 h -7.1 V 81 Z"
                style="d:path('M 443.6 81 H 435 V 75 H 459.3 V 81 H 450.7 V 106.3 H 443.6 V 81 Z')"
                id="path46" />
           </g>
           <g
              id="g62">
             <path
                d="m 187.5,131.2 h 8.9 c 6.3,0 10.6,2.2 10.6,7.6 0,3.2 -1.7,5.8 -4.7,6.8 v 0.2 c 3.9,0.7 6.5,3.2 6.5,7.5 0,6.1 -4.7,9.1 -11.7,9.1 h -9.6 z m 8.2,13.5 c 5.8,0 8.1,-2.1 8.1,-5.5 0,-3.9 -2.7,-5.4 -7.9,-5.4 h -5.1 v 10.9 z m 0.8,15.2 c 5.7,0 9.1,-2.1 9.1,-6.6 0,-4.1 -3.3,-6 -9.1,-6 h -5.8 v 12.6 z"
                style="d:path('M 187.5 131.2 H 196.4 C 202.7 131.2 207 133.4 207 138.8 C 207 142 205.3 144.6 202.3 145.6 V 145.8 C 206.2 146.5 208.8 149 208.8 153.3 C 208.8 159.4 204.1 162.4 197.1 162.4 H 187.5 V 131.2 Z M 195.7 144.7 C 201.5 144.7 203.8 142.6 203.8 139.2 C 203.8 135.3 201.1 133.8 195.9 133.8 H 190.8 V 144.7 H 195.7 Z M 196.5 159.9 C 202.2 159.9 205.6 157.8 205.6 153.3 C 205.6 149.2 202.3 147.3 196.5 147.3 H 190.7 V 159.9 H 196.5 Z')"
                id="path50" />
             <path
                d="m 215.5,131.2 h 17.6 v 2.8 h -14.4 v 10.6 h 12.1 v 2.8 h -12.1 v 12.3 h 14.9 v 2.8 h -18.1 z"
                style="d:path('M 215.5 131.2 H 233.1 V 134 H 218.7 V 144.6 H 230.8 V 147.4 H 218.7 V 159.7 H 233.6 V 162.5 H 215.5 V 131.2 Z')"
                id="path52" />
             <path
                d="m 261.5,162.5 -8.2,-14 c 4.5,-0.9 7.4,-3.8 7.4,-8.7 0,-6.3 -4.4,-8.6 -10.7,-8.6 h -9.4 v 31.3 h 3.3 v -13.7 h 6 l 7.9,13.7 z m -17.7,-28.6 h 5.6 c 5.1,0 8,1.6 8,5.9 0,4.3 -2.8,6.3 -8,6.3 h -5.6 z"
                style="d:path('M 261.5 162.5 L 253.3 148.5 C 257.8 147.6 260.7 144.7 260.7 139.8 C 260.7 133.5 256.3 131.2 250 131.2 H 240.6 V 162.5 H 243.9 V 148.8 H 249.9 L 257.8 162.5 H 261.5 Z M 243.8 133.9 H 249.4 C 254.5 133.9 257.4 135.5 257.4 139.8 C 257.4 144.1 254.6 146.1 249.4 146.1 H 243.8 V 133.9 Z')"
                id="path54" />
             <path
                d="m 267.4,131.2 h 3.3 v 28.5 h 13.9 v 2.8 h -17.2 z"
                style="d:path('M 267.4 131.2 H 270.7 V 159.7 H 284.6 V 162.5 H 267.4 V 131.2 Z')"
                id="path56" />
             <path
                d="m 290.3,131.2 h 3.3 v 31.3 h -3.3 z"
                style="d:path('M 290.3 131.2 H 293.6 V 162.5 H 290.3 V 131.2 Z')"
                id="path58" />
             <path
                d="m 302.6,131.2 h 3.4 l 12,20.6 3.4,6.4 h 0.2 c -0.2,-3.1 -0.4,-6.4 -0.4,-9.6 v -17.4 h 3.1 v 31.3 H 321 l -12,-20.6 -3.4,-6.4 h -0.2 c 0.2,3.1 0.4,6.2 0.4,9.4 v 17.6 h -3.1 v -31.3 z"
                style="d:path('M 302.6 131.2 H 306 L 318 151.8 L 321.4 158.2 H 321.6 C 321.4 155.1 321.2 151.8 321.2 148.6 V 131.2 H 324.3 V 162.5 H 321 L 309 141.9 L 305.6 135.5 H 305.4 C 305.6 138.6 305.8 141.7 305.8 144.9 V 162.5 H 302.7 V 131.2 Z')"
                id="path60" />
           </g>
         </g>
       </defs>
       <use
          x="0"
          xlink:href="#fu-logo-elements"
          y="0"
          id="use82"
          width="100%"
          height="100%"
          transform="matrix(0.97727828,0,0,0.97727828,-48.863914,-24.431957)" />
     </svg>`,
        password: "password",
      },
    });

    // Create 10 jobs
    const jobs = await Promise.all(
      [
        {
          jobTitle: "System Manager (m/w/d) Microsoft Exchange",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "We are looking for a dedicated System Manager to maintain and improve our Microsoft Exchange infrastructure. The ideal candidate has experience in managing large-scale Exchange environments and is familiar with PowerShell scripting.",
          requirements: [
            "Experience in managing Microsoft Exchange environments",
            "Familiarity with PowerShell scripting",
            "Strong problem-solving skills",
            "Good communication and teamwork skills",
          ],
        },
        {
          jobTitle: "Research Assistant in Computer Science",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "The Computer Science department at TU Berlin is seeking a motivated Research Assistant to support our research projects. The candidate should have a strong background in computer science, excellent programming skills, and a desire to contribute to cutting-edge research.",
          requirements: [
            "Master's degree in Computer Science or a related field",
            "Excellent programming skills in at least one language",
            "Familiarity with research methods and tools",
            "Good communication and teamwork skills",
          ],
        },
        {
          jobTitle: "IT Specialist for System Integration",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "TU Berlin is looking for an IT Specialist for System Integration to join our team. The candidate should have experience in integrating complex IT systems, a good understanding of network and security concepts, and strong problem-solving skills.",
          requirements: [
            "Bachelor's degree in Computer Science or a related field",
            "Experience in integrating IT systems and applications",
            "Familiarity with network and security protocols",
            "Strong problem-solving and communication skills",
          ],
        },
        {
          jobTitle: "Lecturer in Mathematics",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "The Mathematics department at TU Berlin is seeking a Lecturer to teach undergraduate and graduate courses. The candidate should have a PhD in Mathematics, a strong record of research, and a passion for teaching and mentoring students.",
          requirements: [
            "PhD in Mathematics or a related field",
            "Strong record of research and publications",
            "Experience in teaching and mentoring students",
            "Good communication and interpersonal skills",
          ],
        },
        {
          jobTitle: "PhD Position in Electrical Engineering",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "The Electrical Engineering department at TU Berlin is offering a PhD position in the field of power electronics. The candidate should have a Master's degree in Electrical Engineering or a related field, a strong background in power electronics, and a desire to pursue a research career.",
          requirements: [
            "Master's degree in Electrical Engineering or a related field",
            "Strong background in power electronics and control systems",
            "Experience in simulation and experimental work",
            "Good communication and teamwork skills",
          ],
        },
        {
          jobTitle: "Administrative Assistant",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "TU Berlin is looking for an Administrative Assistant to support our administrative tasks. The candidate should have excellent organizational and communication skills, a good understanding of MS Office, and a desire to work in a dynamic and international environment.",
          requirements: [
            "High school diploma or equivalent",
            "Excellent organizational and communication skills",
            "Proficiency in MS Office and other office software",
            "Ability to work in a fast-paced and international environment",
          ],
        },
        {
          jobTitle: "Postdoctoral Researcher in Physics",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "The Physics department at TU Berlin is offering a Postdoctoral Researcher position in the field of condensed matter physics. The candidate should have a PhD in Physics, a strong record of research, and a desire to pursue a research career in academia or industry.",
          requirements: [
            "PhD in Physics or a related field",
            "Strong record of research and publications in condensed matter physics",
            "Experience in experimental or theoretical work",
            "Good communication and teamwork skills",
          ],
        },
        {
          jobTitle: "Student Assistant in Mechanical Engineering",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "The Mechanical Engineering department at TU Berlin is seeking a Student Assistant to support our research and teaching activities. The candidate should be enrolled in a Mechanical Engineering or related program, have excellent programming and CAD skills, and a desire to contribute to our projects.",
          requirements: [
            "Enrollment in a Mechanical Engineering or related program",
            "Excellent programming skills in at least one language",
            "Proficiency in CAD and simulation software",
            "Good communication and teamwork skills",
          ],
        },
        {
          jobTitle: "Professorship in Chemistry",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "The Chemistry department at TU Berlin is offering a Professorship in the field of organic chemistry. The candidate should have a PhD in Chemistry, a strong record of research and teaching, and a desire to lead and inspire a team of researchers and students.",
          requirements: [
            "PhD in Chemistry or a related field",
            "Strong record of research and publications in organic chemistry",
            "Experience in teaching and mentoring students",
            "Ability to lead and inspire a team of researchers and students",
          ],
        },
        {
          jobTitle: "Project Manager in Civil Engineering",
          location: "Berlin",
          companyName: "TU Berlin",
          description:
            "TU Berlin is looking for a Project Manager in Civil Engineering to manage and coordinate our construction projects. The candidate should have a Master's degree in Civil Engineering or a related field, experience in project management, and a desire to contribute to our sustainable and innovative projects.",
          requirements: [
            "Master's degree in Civil Engineering or a related field",
            "Experience in project management and coordination",
            "Familiarity with sustainable and innovative construction methods",
            "Good communication and leadership skills",
          ],
        },
      ].map(async (e) => {
        const company = await prisma.company.findFirst({
          where: {
            email: "info@tu-berlin.de",
          },
        });
        return await prisma.job.create({
          data: {
            position: e.jobTitle,
            description: e.description,
            requirements: e.requirements,
            location: e.location,
            companyId: company.id,
          },
        });
      }),
    );

    const jobsFU = await Promise.all(
      [
        {
          jobTitle: "IT Security Specialist",
          location: "Berlin",
          companyName: "FU Berlin",
          description:
            "FU Berlin is seeking an IT Security Specialist to enhance our security infrastructure. The ideal candidate will have experience in IT security management and be proficient in implementing security protocols and measures.",
          requirements: [
            "Experience in IT security management",
            "Proficiency in implementing security protocols",
            "Strong analytical and problem-solving skills",
            "Good communication and teamwork skills",
          ],
        },
        {
          jobTitle: "Postdoctoral Researcher in Biology",
          location: "Berlin",
          companyName: "FU Berlin",
          description:
            "The Biology department at FU Berlin is offering a Postdoctoral Researcher position in molecular biology. The candidate should have a PhD in Biology, a strong record of research, and experience in laboratory techniques.",
          requirements: [
            "PhD in Biology or a related field",
            "Strong record of research and publications in molecular biology",
            "Experience with laboratory techniques",
            "Good communication and teamwork skills",
          ],
        },
        {
          jobTitle: "Lecturer in Sociology",
          location: "Berlin",
          companyName: "FU Berlin",
          description:
            "The Sociology department at FU Berlin is seeking a Lecturer to teach undergraduate and graduate courses. The candidate should have a PhD in Sociology, a strong record of research, and a passion for teaching and mentoring students.",
          requirements: [
            "PhD in Sociology or a related field",
            "Strong record of research and publications",
            "Experience in teaching and mentoring students",
            "Good communication and interpersonal skills",
          ],
        },
        {
          jobTitle: "Software Developer",
          location: "Berlin",
          companyName: "FU Berlin",
          description:
            "FU Berlin is looking for a Software Developer to join our IT team. The candidate should have experience in software development, proficiency in multiple programming languages, and a good understanding of software development life cycle.",
          requirements: [
            "Bachelor's degree in Computer Science or a related field",
            "Experience in software development",
            "Proficiency in multiple programming languages",
            "Strong problem-solving and communication skills",
          ],
        },
        {
          jobTitle: "Administrative Coordinator",
          location: "Berlin",
          companyName: "FU Berlin",
          description:
            "FU Berlin is seeking an Administrative Coordinator to oversee administrative operations. The candidate should have excellent organizational skills, proficiency in office software, and experience in managing administrative tasks.",
          requirements: [
            "Bachelor's degree or equivalent experience",
            "Excellent organizational and communication skills",
            "Proficiency in office software",
            "Ability to manage multiple tasks efficiently",
          ],
        },
      ].map(async (e) => {
        const company = await prisma.company.findFirst({
          where: {
            email: "info@fu-berlin.de",
          },
        });
        return await prisma.job.create({
          data: {
            position: e.jobTitle,
            description: e.description,
            requirements: e.requirements,
            location: e.location,
            companyId: company.id,
          },
        });
      }),
    );

    // Create a CV
    const personalInfo = {
      firstName: "John",
      lastName: "Doe",
      dob: "01/01/1990",
      nationality: "American",
      image:
        "https://images.squarespace-cdn.com/content/v1/6091c3e4f5f6071721c43f77/1683711745725-O1R2JQOY9II73V828PYS/Midjourney+Headshot.jpg",
      gender: "Male",
      aboutMe: "A software engineer with 5 years of experience",
      email: "johndoe@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    };

    const workExperience = {
      position: "Software Engineer",
      employer: "Previous Company",
      from: "01/01/1990",
      to: "01/01/1995",
      city: "Anytown",
      country: "USA",
      summary: "Worked on various software projects",
    };

    const education = {
      title: "Bachelor of Science in Computer Science",
      institutionName: "University of Anytown",
      website: "www.university.edu",
      from: "01/01/1990",
      to: "01/01/2000",
      city: "Anytown",
      country: "USA",
    };

    const resumeFormData = {
      personalInfo,
      workExperiences: [workExperience],
      educations: [education],
    };

    const cv = await prisma.cV.create({
      data: {
        file_name: "John Doe's Resume",
        cv: JSON.stringify(resumeFormData),
        userId: user.id,
      },
    });

    // Create a job application
    const jobApplication = await prisma.jobApplication.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        job: {
          connect: {
            id: jobs[0].id, // connect to the first job for simplicity
          },
        },
        cv: {
          connect: {
            id: cv.id,
          },
        },
      },
    });

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
