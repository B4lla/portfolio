export type Locale = 'en' | 'es';
export type View = 'presentation' | 'engineering';
export type ProjectId = 'frame' | 'eufunding' | 'notes';

const publicEmail = (import.meta.env.PUBLIC_CONTACT_EMAIL ?? '').trim();
export function normaliseLinkedInUrl(value: string): string {
  const candidate = value.trim();
  if (!candidate) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate.replace(/^\/+/, '')}`);
    if (!['linkedin.com', 'www.linkedin.com'].includes(url.hostname.toLowerCase())) return '';
    url.protocol = 'https:';
    return url.href;
  } catch { return ''; }
}
export const identity = {
  displayName: 'Álvaro Ballabriga',
  initials: 'AB',
  github: 'https://github.com/B4lla',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail) ? publicEmail : '',
  linkedin: 'www.linkedin.com/in/alvaro-ballabriga-ortega', 
  resume: { es: '/cv/cv-es.pdf', en: '/cv/cv-en.pdf' } as Record<Locale, string>, // Visible only if the PDF exists
};
export const sources = {
  eufunding: 'https://github.com/B4lla/euFunding',
  eufundingApi: 'https://github.com/B4lla/euFunding/blob/main/api/calls.js',
  eufundingUI: 'https://github.com/B4lla/euFunding/blob/main/src/main.js',
  eufundingCompanies: 'https://github.com/B4lla/euFunding/blob/main/api/companies.js',
  eufundingInterest: 'https://github.com/B4lla/euFunding/blob/main/api/interest.js',
  ds2: 'https://www.dataspace2.eu/',
  notes: 'https://github.com/B4lla/SecureNotes',
  notesApi: 'https://github.com/B4lla/SecureNotes/blob/main/backend/routes/notes.js',
  notesCrypto: 'https://github.com/B4lla/SecureNotes/blob/main/frontend/src/utils/crypto.js',
};

// Images
export type PublicImage = {
  src: string;
  alt: Record<Locale, string>;
  caption?: Partial<Record<Locale, string>>;
  aspectRatio: string;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  mobileObjectFit?: 'cover' | 'contain';
  mobileObjectPosition?: string;
};

type ProjectImages = { cover: PublicImage; gallery: PublicImage[] };
export const media: {
  profile: PublicImage;
  projects: Record<ProjectId, ProjectImages>;
  socialPreview: Record<Locale, PublicImage>;
  favicon: string;
} = {
  profile: {
    src: '/images/profile.webp',
    alt: { es: 'Fotografía de Álvaro Ballabriga', en: 'Portrait of Álvaro Ballabriga' },
    aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', mobileObjectFit: 'contain',
  },
  projects: {
    frame: {
      cover: {
        src: '/images/frame/editor.webp',
        alt: { es: 'Vista real del editor visual Frame', en: 'Real view of the Frame visual editor' },
        caption: { es: 'Frame · editor visual', en: 'Frame · visual editor' },
        aspectRatio: '16 / 10', objectFit: 'contain', objectPosition: 'center',
      },
      gallery: [
        {
          src: '/images/frame/export.webp',
          alt: { es: 'Resultado real exportado desde Frame', en: 'Real output exported from Frame' },
          caption: { es: 'Frame · resultado exportado', en: 'Frame · exported output' },
          aspectRatio: '16 / 10', objectFit: 'contain',
        },
        // Add further genuine screenshots here. No changes to components needed.
      ],
    },
    eufunding: {
      cover: {
        src: '/images/eufunding/interface.webp',
        alt: { es: 'Interfaz real de consulta de convocatorias de euFunding', en: 'Real euFunding calls search interface' },
        caption: { es: 'euFunding · interfaz de consulta', en: 'euFunding · search interface' },
        aspectRatio: '16 / 10', objectFit: 'contain',
      },
      gallery: [],
    },
    notes: {
      cover: {
        src: '/images/securenotes/application.webp',
        alt: { es: 'Interfaz real de la aplicación SecureNotes', en: 'Real SecureNotes application interface' },
        caption: { es: 'SecureNotes · aplicación', en: 'SecureNotes · application' },
        aspectRatio: '16 / 10', objectFit: 'contain',
      },
      gallery: [],
    },
  },
  socialPreview: {
    es: { src: '/social-preview-es.png', alt: { es: 'Álvaro Ballabriga · Desarrollo de software full-stack', en: 'Álvaro Ballabriga · Full-stack software developer' }, aspectRatio: '40 / 21' },
    en: { src: '/social-preview-en.png', alt: { es: 'Álvaro Ballabriga · Desarrollo de software full-stack', en: 'Álvaro Ballabriga · Full-stack software developer' }, aspectRatio: '40 / 21' },
  },
  favicon: '/favicon.svg',
};

type Project = {
  id: ProjectId; name: string; category: string; stack: string; description: string;
  descriptionExtra: string; focus: string; status: string; link?: string; linkLabel: string; caseAnchor: string;
};
type Experience = {
  organisation: string; role: string; duration: string; location: string; body: string;
  highlights?: string[]; featured?: boolean;
  links?: { label: string; url: string }[];
};
type Education = { name: string; status: string; body: string };
type TechnicalCase = {
  id: 'frame' | 'eufunding' | 'systems'; project: ProjectId; name: string; eyebrow: string; stack: string;
  title: string; introduction: string; problem: string; decision: string; result: string; limit: string;
  steps: { title: string; detail: string }[];
  evidence: string; sourceLinks?: { label: string; url: string }[];
  code?: string; codeCaption?: string; backLink?: string;
};
type Copy = {
  skip: string;
  nav: { presentation: string; engineering: string; about: string; experience: string; projects: string; education: string; approach: string;
    contact: string; toTop: string; switchDimension: string; switchLanguage: string };
  meta: { presentationTitle: string; presentationDescription: string; engineeringTitle: string;
    engineeringDescription: string; personSummary: string };
  hero: { byline: string; role: string; lead: string; technologiesLabel: string; technologies: string; about: string; projects: string; contact: string };
  resume: { label: string; spanish: string; english: string };
  about: { eyebrow: string; noteLabel: string; introduction: string; paragraphs: string[];
    notes: { index: string; title: string; detail: string }[] };
  thinking: { eyebrow: string; titleA: string; titleB: string; lead: string; extra: string;
    cards: { title: string; body: string }[]; link: string };
  experience: { eyebrow: string; title: string; intro: string; entries: Experience[] };
  education: { eyebrow: string; title: string; entries: Education[] };
  work: { eyebrow: string; titleA: string; titleB: string; lead: string; focus: string; details: string; projects: Project[] };
  transition: { title1: string; title2: string; sub: string };
  contact: { title: string; profileTitle: string; lead: string; profileLead: string; github: string; email: string; footer: string };
  engineering: { eyebrow: string; headline1: string; headline2: string; lead: string; jump: string;
    labels: { problem: string; decision: string; result: string; limit: string; flow: string; source: string; evidence: string }; cases: TechnicalCase[] };
};

const es: Copy = {
  skip: 'Saltar al contenido',
  nav: { presentation: 'Personal', engineering: 'Ingeniería', about: 'Sobre mí', experience: 'Experiencia',
    projects: 'Proyectos', education: 'Formación', approach: 'Cómo trabajo', contact: 'Contacto', toTop: 'Volver al inicio', switchDimension: 'Cambiar de perspectiva', switchLanguage: 'Seleccionar idioma' },
  meta: {
    presentationTitle: 'Álvaro Ballabriga | Desarrollador de software full-stack',
    presentationDescription: 'Álvaro Ballabriga, desarrollador de software full-stack orientado al desarrollo web, las APIs y los datos. Formación en IA y Data Engineering en Tajamar Tech. Experiencia internacional Erasmus+.',
    engineeringTitle: 'Ingeniería de software | Álvaro Ballabriga',
    engineeringDescription: 'Casos técnicos de Álvaro Ballabriga: editor visual Frame, integración de convocatorias europeas en euFunding y autorización de datos en SecureNotes. Decisiones, implementación y límites.',
    personSummary: 'Álvaro Ballabriga es desarrollador de software full-stack, con experiencia de prácticas en desarrollo web internacional en Transilvania IT Cluster (Erasmus+, marzo-mayo de 2026), soporte técnico en E-Gaming (2025) y Anadat Technology (2024). Es Técnico Superior en Desarrollo de Aplicaciones Web, FP oficial española de Grado Superior (EQF 5), y cursa un programa privado no universitario en Inteligencia Artificial y Data Engineering en Tajamar Tech. Desarrolla Frame, un editor visual web en estabilización, y proyectos públicos como euFunding y SecureNotes.',
  },
  hero: {
    byline: 'DESARROLLO DE SOFTWARE / FULL-STACK',
    role: 'Desarrollador de software full-stack.',
    lead: 'Construyo aplicaciones web conectando interfaces, servicios y datos. Ahora amplío esa base con formación en IA y Data Engineering.',
    technologiesLabel: 'Tecnologías', technologies: 'TypeScript · React · Next.js · Node.js · PostgreSQL',
    about: 'Sobre mí', projects: 'Ver mi trabajo', contact: 'Contacto',
  },
  resume: { label: 'Currículum', spanish: 'CV en español', english: 'CV en inglés' },
  about: {
    eyebrow: '01 / SOBRE MÍ', noteLabel: 'Lo que me interesa', introduction: 'Me interesa lo que hay detrás de cada aplicación.',
    paragraphs: [
      'Empecé desarrollando aplicaciones web porque quería construir cosas que otras personas pudieran usar. Me interesa entender el recorrido completo, desde una interacción en pantalla hasta la lógica y los datos que la hacen posible.',
      'Disfruto trabajando en productos donde hay que conectar muchas piezas, tomar decisiones prácticas y corregir lo que no funciona como se esperaba. Ahora estudio IA y Data Engineering para profundizar en sistemas centrados en datos.',
    ],
    notes: [
      { index: '01', title: 'Producto e interfaz.', detail: 'Que una herramienta sea clara de usar importa tanto como su implementación.' },
      { index: '02', title: 'Lógica y datos.', detail: 'Entender cómo se conectan el frontend, las APIs y la persistencia.' },
      { index: '03', title: 'Aprender haciendo.', detail: 'Trabajar con proyectos reales, revisar errores y contrastar decisiones.' },
    ],
  },
  thinking: {
    eyebrow: '05 / CÓMO TRABAJO', titleA: 'Cómo', titleB: 'trabajo.',
    lead: 'De un problema concreto a una solución que se pueda comprobar.',
    extra: 'Prefiero avanzar en incrementos que puedan revisarse y detectar los límites de una solución antes de darla por terminada.',
    cards: [
      { title: 'Delimitar el problema.', body: 'Identifico el comportamiento esperado, las restricciones y las dependencias antes de introducir cambios.' },
      { title: 'Implementar y comprobar.', body: 'Trabajo en partes manejables y contrasto el resultado con casos reales, no solo con la implementación prevista.' },
      { title: 'Corregir y comunicar.', body: 'Documento incidencias y decisiones; comparto los cambios relevantes cuando afectan a otras personas o sistemas.' },
    ],
    link: 'Ver decisiones de ingeniería',
  },
  experience: {
    eyebrow: '02 / EXPERIENCIA', title: 'Experiencia en desarrollo y entornos técnicos.',
    intro: 'Desarrollo web en un equipo internacional y experiencia previa en soporte e infraestructura.',
    entries: [
      {
        organisation: 'Transilvania IT Cluster', role: 'Desarrollador web en prácticas · Erasmus+',
        duration: 'Mar. 2026 — may. 2026 · 3 meses', location: 'Cluj-Napoca, Rumanía · Presencial · Jornada completa',
        body: 'Desarrollo web en prácticas Erasmus+ y colaboración técnica en un entorno internacional.', featured: true,
        highlights: [
          'Diseñé y desarrollé una página responsive para una iniciativa de espacios de datos municipales, trabajando con colaboradores externos.',
          'Participé en reuniones ágiles con equipos de España, Estonia, Grecia y Francia para coordinar el trabajo relacionado con un conector de datos.',
          'Resolví incidencias en un entorno WordPress con PHP y colaboré en tareas de migración del proyecto hacia Next.js.',
          'Desarrollé euFunding, una aplicación para consultar, filtrar y exportar convocatorias europeas a partir de una API externa.',
        ],
        links: [{ label: 'Código de euFunding', url: sources.eufunding }, { label: 'Contexto de DS2', url: sources.ds2 }],
      },
      {
        organisation: 'E-Gaming', role: 'Técnico de hardware y soporte en prácticas',
        duration: '2025 · aproximadamente 3 semanas', location: 'Coslada, Madrid · Presencial',
        body: 'Diagnóstico y mantenimiento básico de equipos y periféricos; registro de incidencias, escalado y apoyo en revisiones de red.',
      },
      {
        organisation: 'Anadat Technology', role: 'Técnico de soporte N1 en prácticas',
        duration: 'Abr. 2024 — jun. 2024 · 3 meses', location: 'Madrid · Remoto',
        body: 'Monitorización de servicios, atención inicial a alertas, registro de tickets, comprobaciones remotas y escalado de incidencias siguiendo procedimientos.',
      },
    ],
  },
  education: {
    eyebrow: '04 / FORMACIÓN', title: 'Una base de desarrollo. Una especialización en curso.',
    entries: [
      { name: 'Técnico Superior en Desarrollo de Aplicaciones Web (DAW)', status: 'Completado · FP de Grado Superior oficial · EQF 5',
        body: 'Formación profesional superior en programación, aplicaciones web y bases de datos.' },
      { name: 'Inteligencia Artificial y Data Engineering · Tajamar Tech', status: 'En curso · Programa privado no universitario de Tajamar Tech',
        body: 'Formación complementaria en sistemas de Inteligencia Artificial y Data Engineering sobre una base de desarrollo de software.' },
    ],
  },
  work: {
    eyebrow: '03 / TRABAJO SELECCIONADO', titleA: 'Trabajo', titleB: 'seleccionado.',
    lead: 'Tres proyectos con distintos alcances: un producto propio, una herramienta de datos y una aplicación web más acotada.',
    focus: 'Qué demuestra', details: 'Ver caso técnico',
    projects: [
      { id: 'frame', name: 'Frame', category: 'EDITOR VISUAL WEB / PRODUCTO PROPIO',
        stack: 'TYPESCRIPT · REACT · NEXT.JS · POSTGRESQL · CLOUDFLARE',
        description: 'Frame es mi principal proyecto personal: un editor visual web para crear páginas responsive y exportarlas como código. Mi objetivo es que un diseño hecho visualmente pueda seguir utilizándose fuera del editor.',
        descriptionExtra: 'He desarrollado la edición visual, las vistas responsive y la exportación de código. Actualmente trabajo en su estabilización y mejora.',
        focus: 'El trabajo entre modelo de documento, canvas y código generado.',
        status: 'Proyecto privado · Funcionalidad principal desarrollada · En estabilización', linkLabel: 'Ver caso técnico', caseAnchor: 'frame' },
      { id: 'eufunding', name: 'euFunding', category: 'PANEL DE DATOS / PRÁCTICAS EN TRANSILVANIA IT CLUSTER',
        stack: 'JAVASCRIPT · VITE · EXPRESS · POSTGRESQL · API EUROPEA',
        description: 'Desarrollé durante mis prácticas una aplicación web para explorar convocatorias de financiación de la Unión Europea. Incluye consulta de convocatorias a una API de la Comisión Europea, filtros por diferentes atributos, búsquedas, exportación de resultados y funcionalidades para trabajar con empresas y niveles de interés.',
        descriptionExtra: 'Me ocupé de la integración de datos, la API de la aplicación y la presentación de los resultados. Es un proyecto de prácticas, no el conjunto del trabajo del consorcio.',
        focus: 'Consumo de APIs externas, tratamiento de registros, filtros y persistencia.',
        status: 'Proyecto de prácticas · Código público', link: sources.eufunding, linkLabel: 'Ver repositorio', caseAnchor: 'eufunding' },
      { id: 'notes', name: 'SecureNotes', category: 'APLICACIÓN WEB / PROYECTO PERSONAL',
        stack: 'VUE · EXPRESS · POSTGRESQL',
        description: 'Aplicación de notas con cliente Vue, API Express y PostgreSQL. Incluye cifrado del contenido en el navegador y restricciones de acceso por usuario en las operaciones de la API.',
        descriptionExtra: 'Un ejemplo más pequeño de separación de responsabilidades entre el cifrado en cliente y el control de acceso en servidor.',
        focus: 'División de responsabilidades entre cliente, servidor y base de datos.',
        status: 'Proyecto personal · Código público', link: sources.notes, linkLabel: 'Ver repositorio', caseAnchor: 'systems' },
    ],
  },
  transition: { title1: 'Es solo', title2: 'una parte de la historia.', sub: 'LAS DECISIONES QUE HAY DETRÁS' },
  contact: {
    title: 'Podemos hablar de software, datos e ideas.', profileTitle: 'Podemos hablar de software, datos e ideas.',
    lead: 'Si mi perfil encaja con un proyecto o quieres conocer mejor alguna de las decisiones detrás de mi trabajo, puedes escribirme o consultar mis repositorios públicos.',
    profileLead: 'Si mi perfil encaja con un proyecto o quieres conocer mejor alguna de las decisiones detrás de mi trabajo, puedes consultar mis repositorios públicos.',
    github: 'GitHub', email: 'Enviar correo', footer: 'Desarrollo de software full-stack',
  },
  engineering: {
    eyebrow: 'INGENIERÍA / SISTEMAS Y DECISIONES', headline1: 'Lo que ocurre', headline2: 'detrás.',
    lead: 'Dos casos principales sobre edición visual e integración de datos. Un tercero, más acotado, muestra la separación entre cifrado y autorización.',
    jump: 'Explorar los casos',
    labels: { problem: 'El problema', decision: 'El enfoque', result: 'Implementación abordada', limit: 'Límites y compromisos', flow: 'Flujo técnico', source: 'Examinar el código', evidence: 'Evidencia disponible' },
    cases: [
      { id: 'frame', project: 'frame', name: 'Frame', eyebrow: '01 / FRAME · EDITOR VISUAL',
        stack: 'EDITOR · DOCUMENTO · EXPORTACIÓN', title: 'Un mismo documento, tres representaciones.',
        introduction: 'Frame conecta un árbol de componentes editable, su representación visual y el código exportado. Los cambios en una de estas capas no deberían alterar el resultado en las otras.',
        problem: 'Al redimensionar elementos o moverlos entre contenedores pueden aparecer desplazamientos y cambios de tamaño inesperados. El canvas y el código exportado también pueden interpretar un mismo diseño de forma diferente.',
        decision: 'Separar el estado y la estructura de nodos del documento de su representación en el canvas y de su transformación a código. Revisar tamaños, posiciones y comportamiento responsive en ambas salidas.',
        result: 'El editor ya conecta la manipulación de nodos, las vistas responsive y la generación de páginas exportables. Verifico la equivalencia entre el documento, el canvas y el resultado generado.',
        limit: 'La fidelidad entre las vistas y el resultado exportado todavía necesita comprobaciones. No considero resueltas estas incidencias mientras se mantengan casos inconsistentes.',
        steps: [
          { title: 'Documento editable', detail: 'Árbol de nodos y propiedades que definen los componentes y su composición.' },
          { title: 'Canvas y responsive', detail: 'Interacción, medidas y vistas que representan el estado editable.' },
          { title: 'Generación de código', detail: 'Convertir el documento en una página exportable y contrastarla con el canvas.' },
        ],
        evidence: 'La implementación de Frame es privada; la exposición técnica se centra en el modelo de documento, las transformaciones y la fidelidad entre representaciones.',
        backLink: 'Ver Frame en proyectos',
      },
      { id: 'eufunding', project: 'eufunding', name: 'euFunding', eyebrow: '02 / EUFUNDING · DATOS Y APLICACIÓN WEB',
        stack: 'API EUROPEA · EXPRESS · POSTGRESQL', title: 'De una fuente de datos externa a una herramienta de consulta.',
        introduction: 'El panel reúne convocatorias de financiación europea y permite examinarlas, filtrarlas y exportar resultados.',
        problem: 'Una fuente externa puede ofrecer información abundante y heterogénea. Para que sirva en una aplicación hay que consultar los datos, normalizarlos, presentar campos coherentes y proporcionar formas de encontrar registros relevantes.',
        decision: 'Resolver la consulta en una API Node/Express y presentar los resultados en una interfaz con búsqueda, filtros y paginación. Complementar el flujo con persistencia PostgreSQL para empresas y niveles de interés.',
        result: 'La aplicación integra una API externa de convocatorias, ofrece filtros y exportación CSV/Excel e incorpora persistencia para empresas e intereses. Enlaces al código público disponibles a continuación.',
        limit: 'La clasificación por palabras y expresiones regulares es una aproximación basada en reglas; no es un modelo de machine learning. La calidad de las categorías depende de sus reglas y de los datos recibidos.',
        steps: [
          { title: 'API externa', detail: 'Consultar convocatorias de financiación europea.' },
          { title: 'Tratamiento de datos', detail: 'Normalizar y categorizar los campos relevantes.' },
          { title: 'Exploración', detail: 'Facilitar búsqueda, filtros, exportación y persistencia selectiva.' },
        ],
        evidence: 'Código público: las rutas de consulta, interfaz y persistencia pueden contrastarse en los archivos enlazados. La clasificación se basa en reglas, no en un modelo de IA.',
        sourceLinks: [
          { label: 'Repositorio', url: sources.eufunding },
          { label: 'api/calls.js', url: sources.eufundingApi },
          { label: 'src/main.js', url: sources.eufundingUI },
          { label: 'api/companies.js', url: sources.eufundingCompanies },
          { label: 'api/interest.js', url: sources.eufundingInterest },
        ],
      },
      { id: 'systems', project: 'notes', name: 'SecureNotes', eyebrow: '03 / SECURENOTES · API Y SEGURIDAD',
        stack: 'VUE · EXPRESS · POSTGRESQL', title: 'Cifrar información no sustituye autorizar su acceso.',
        introduction: 'Una aplicación de notas necesita distinguir entre proteger contenido y restringir qué registros puede consultar cada usuario.',
        problem: 'El cifrado y la autorización actúan en capas diferentes. El contenido podría estar cifrado y aun así existir un fallo de acceso a los registros de otro usuario.',
        decision: 'Mantener el cifrado del contenido en el cliente y asociar las consultas de la API al usuario autenticado.',
        result: 'Las operaciones de lectura, actualización y borrado utilizan el identificador del usuario para limitar los registros relevantes.',
        limit: 'Es un proyecto personal, no una solución de seguridad auditada. La gestión de claves y las validaciones necesitan revisión adicional antes de recomendarlo para datos sensibles.',
        steps: [
          { title: 'Cliente', detail: 'Cifrar el contenido de la nota en el navegador.' },
          { title: 'Autenticación API', detail: 'Identificar al usuario y delimitar sus operaciones.' },
          { title: 'PostgreSQL', detail: 'Consultar registros limitados al usuario correspondiente.' },
        ],
        evidence: 'Caso más pequeño: repositorio público con rutas de notas y lógica de cifrado en cliente. Es una implementación de aprendizaje, no una auditoría de seguridad.',
        sourceLinks: [{ label: 'Examinar código', url: sources.notesApi }, { label: 'Cifrado en cliente', url: sources.notesCrypto }],
      },
    ],
  },
};


const en: Copy = es;

export const content: Record<Locale, Copy> = { en, es };
export const paths = (locale: Locale) => ({ presentation: `/${locale}/`, engineering: `/${locale}/engineering/` });
