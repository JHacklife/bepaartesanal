# Sistema de Temas Marítimo - BEPA Artesanal

## 🎨 Descripción del Sistema

Este proyecto implementa un sistema de temas avanzado con paleta de colores marítima y efectos visuales modernos para la aplicación BEPA (Bitácora Electrónica de Pesca Artesanal).

## ✨ Características Principales

### 🌊 Temas Disponibles

1. **Marítimo (Predeterminado)**
   - Colores inspirados en el océano y la vida marina
   - Azules, aguamarinas y tonos oceánicos
   - Fondos con gradientes marítimos

2. **Bosque**
   - Paleta de verdes naturales
   - Inspirado en la tierra y la vegetación
   - Ambiente natural y orgánico

3. **Atardecer**
   - Colores cálidos del atardecer
   - Naranjas, rojos y dorados
   - Ambiente acogedor y cálido

### 🎯 Funcionalidades

- **Modo Claro/Oscuro**: Soporte completo para ambos modos
- **Persistencia**: Los temas se guardan automáticamente
- **Transiciones Suaves**: Cambios animados entre temas
- **Efectos Glassmorphism**: Elementos con transparencia y desenfoque
- **Animaciones Fluidas**: Efectos de olas y movimiento oceánico
- **Sombras Personalizadas**: Sombras temáticas según el tema activo

## 🛠️ Componentes del Sistema

### ThemeManager
Componente principal para la gestión de temas:
```tsx
<ThemeManager />
```

### Hooks Personalizados
- `useCustomTheme()`: Hook para gestionar temas personalizados
- `useTheme()`: Hook de next-themes para modo claro/oscuro

### Clases CSS Disponibles

#### Efectos de Cristal
```css
.glass              /* Efecto glassmorphism básico */
.glass-card         /* Card con efecto glass */
```

#### Gradientes Temáticos
```css
.maritime-gradient  /* Gradiente marítimo */
.theme-background   /* Fondo temático con imagen */
```

#### Animaciones
```css
.ocean-animation    /* Animación de olas oceánicas */
.wave-pattern       /* Patrón de ondas */
.float-animation    /* Animación flotante */
```

#### Sombras
```css
.maritime-shadow    /* Sombra marítima básica */
.maritime-shadow-lg /* Sombra marítima grande */
```

## 🎨 Paleta de Colores

### Variables CSS Principales
```css
--primary          /* Color primario temático */
--secondary        /* Color secundario */
--accent           /* Color de acento */
--background       /* Fondo principal */
--foreground       /* Texto principal */
--muted            /* Elementos atenuados */
--border           /* Bordes */
```

### Colores Adicionales
- **Ocean**: Tonos oceánicos (50-900)
- **Coral**: Tonos de coral (50-900)
- **Seaweed**: Tonos de algas marinas (50-900)

## 📁 Estructura de Archivos

```
components/
├── theme-manager.tsx      # Gestor principal de temas
├── theme-provider.tsx     # Proveedor de contexto de temas
├── maritime-showcase.tsx  # Componente de demostración
└── ui/                    # Componentes UI base

app/
├── globals.css           # Estilos globales y variables CSS
├── layout.tsx           # Layout principal con ThemeProvider
├── page.tsx             # Página principal con nuevo sistema
└── themes/
    └── page.tsx         # Página de demostración de temas

lib/
└── utils.ts             # Utilidades
```

## 🚀 Uso Rápido

### 1. Cambiar Tema
```tsx
import { ThemeManager } from '@/components/theme-manager'

function Header() {
  return (
    <div>
      <ThemeManager />
    </div>
  )
}
```

### 2. Usar Efectos Visuales
```tsx
<Card className="glass-card card-hover maritime-shadow">
  <CardContent className="ocean-animation">
    Contenido con efectos marítimos
  </CardContent>
</Card>
```

### 3. Aplicar Colores Temáticos
```tsx
<Button className="maritime-gradient">
  Botón con gradiente marítimo
</Button>

<div className="bg-ocean-500 text-white">
  Elemento con color oceánico
</div>
```

## 🎨 Personalización

### Agregar Nuevo Tema
1. Abrir `components/theme-manager.tsx`
2. Añadir nuevo objeto al array `customThemes`:

```tsx
{
  name: 'nuevo-tema',
  label: 'Nuevo Tema',
  description: 'Descripción del tema',
  icon: <Icon className="h-4 w-4" />,
  colors: {
    light: { /* Variables para modo claro */ },
    dark: { /* Variables para modo oscuro */ }
  }
}
```

### Crear Nuevos Efectos
1. Añadir CSS en `globals.css`:
```css
.mi-efecto-personalizado {
  background: linear-gradient(45deg, var(--primary), var(--accent));
  animation: mi-animacion 2s infinite;
}
```

2. Usar en componentes:
```tsx
<div className="mi-efecto-personalizado">
  Contenido con efecto personalizado
</div>
```

## 🌐 Navegación

- **Página Principal**: `/` - Aplicación BEPA con nuevo sistema de temas
- **Demostración**: `/themes` - Showcase completo del sistema de temas

## 📱 Responsividad

El sistema está optimizado para:
- **Desktop**: Efectos completos y animaciones fluidas
- **Tablet**: Adaptación de efectos glassmorphism
- **Mobile**: Animaciones reducidas para mejor rendimiento

## 🔧 Configuración Técnica

### Dependencias
- `next-themes`: Gestión de modo claro/oscuro
- `tailwindcss`: Framework CSS
- `lucide-react`: Iconos
- `@radix-ui`: Componentes base

### Variables de Entorno
No requiere variables de entorno específicas.

## 🎭 Características Avanzadas

- **Transiciones CSS**: Cambios suaves entre temas
- **Persistencia Local**: Temas guardados en localStorage
- **Detección de Sistema**: Respeta preferencias del sistema operativo
- **Optimización de Rendimiento**: Animaciones GPU-aceleradas
- **Accesibilidad**: Contraste adecuado en todos los temas

---

## 🌊 ¡Disfruta explorando los temas marítimos!

El sistema está diseñado para proporcionar una experiencia visual rica y envolvente que refleje el entorno marino de la pesca artesanal.
