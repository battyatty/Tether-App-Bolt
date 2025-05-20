/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
       // Tidewake Theme
        Tidewake: {
          // 🌊 Core Blues
          background: '#6389C9',        // tetherBlue – app background
          backgroundAlt: '#6992D6',     // tetherBlue2 – slight variation for selections
          cardShadow: '#587EBF',        // deckShadow – card shadows
          text: '#556996',              // primaryTextBlue – body text
          icon: '#535992',              // iconRoyal – button icons
          card: '#DBE9FF',              // fogBank – card background
          accentSoft: '#A0D6FF',        // seaBurst – hover/edge accents
          sectionHeader: '#89B0EE',     // babyBlanket – section titles, pause button
          noteBackground: '#B2CFFF',    // sirenFog – task notes background
          anchorInactive: '#98B0D7',    // sirenFog2 – off anchor states
          textAlt: '#426092',           // cornflowerFaded – secondary text
          buttonBg: '#2D4877',          // cornflower – button 3, radial bg
          accentKB: '#0F2E4D',          // deepCurrent – kitblock accents, focus OFF
      
          // 🐚 Teals (Core Motion / Flow)
          playIcon: '#138C76',          // serpentine – play button icon
          playRing: '#54D9C1',          // kelpglow – ring around play
          timer: '#87E4D3',             // tidewake – radial & countdown color
          tealAccent: '#A3F9DD',        // driftglass – icon highlight
          tealAccentAlt: '#B6FFF2',     // driftglass2 – decorative hover
      
          // 🟢 Greens (Success / Active)
          success: '#B0FA98',           // limarita – complete button, progress bar, glow
          successIcon: '#569F3B',       // plankton – checkmark
      
          // 🟣 Purples (Anchor States)
          anchor: '#BF92FF',            // anchorlight – active anchor state
          anchorDark: '#5B3690',        // mystreef – dark pair for anchor states
      
          // ⚪ Neutrals
          textBright: '#FAF7F0',        // sandswept – lightest text (titles)
          textMuted: '#D9D9D9',         // sandstorm – muted text + button backgrounds
      
          // 🔴 Alerts
          alert: '#FF7E7E',             // shrimpDelight – overtime, error
          paused: '#FFC07D',            // solarDrift – paused timer
        },
        // Grounded Serenity Theme
        rope: {
          50: '#F7F4F0',
          100: '#EDE5DA',
          200: '#E2D5C5',
          300: '#D7C5B0',
          400: '#CCB59B',
          500: '#C1A78F',
          600: '#B69780',
          700: '#AB8771',
          800: '#A07762',
          900: '#956753'
        },
        earth: {
          50: '#F4F1EE',
          100: '#E9E3DD',
          200: '#DED5CC',
          300: '#D3C7BB',
          400: '#C8B9AA',
          500: '#C1A78F',
          600: '#B69780',
          700: '#AB8771',
          800: '#A07762',
          900: '#956753'
        },
        navy: {
          50: '#E6E8EC',
          100: '#CDD1D9',
          200: '#B4BAC6',
          300: '#9BA3B3',
          400: '#828CA0',
          500: '#69758D',
          600: '#505E7A',
          700: '#374767',
          800: '#2E3A59',
          900: '#1E2D46'
        },
        mist: {
          50: '#F5F8F9',
          100: '#EBF1F3',
          200: '#E1EAEC',
          300: '#D7E3E5',
          400: '#CDDDDF',
          500: '#BFD8DB',
          600: '#B5D2D5',
          700: '#ABCCCF',
          800: '#A1C6C9',
          900: '#97C0C3'
        },
        // Deep Focus Theme
        charcoal: {
          50: '#E8E8E8',
          100: '#D1D1D1',
          200: '#BABABA',
          300: '#A3A3A3',
          400: '#8C8C8C',
          500: '#757575',
          600: '#5E5E5E',
          700: '#474747',
          800: '#1E1E1E',
          900: '#171717'
        },
        slate: {
          50: '#F7F7F7',
          100: '#EFEFEF',
          200: '#DCDCDC',
          300: '#BDBDBD',
          400: '#989898',
          500: '#7C7C7C',
          600: '#656565',
          700: '#525252',
          800: '#3A3A3C',
          900: '#292929'
        },
        signal: {
          50: '#E5F1FF',
          100: '#CCE4FF',
          200: '#99C9FF',
          300: '#66ADFF',
          400: '#3392FF',
          500: '#007AFF',
          600: '#0062CC',
          700: '#004999',
          800: '#003166',
          900: '#001833'
        },
        cloud: {
          50: '#FFFFFF',
          100: '#FCFCFC',
          200: '#F9F9F9',
          300: '#F7F7F7',
          400: '#F4F4F4',
          500: '#F1F1F1',
          600: '#E1E1E1',
          700: '#D1D1D1',
          800: '#C1C1C1',
          900: '#B1B1B1'
        },
        mint: {
          50: '#F0FEF4',
          100: '#D3FCDF',
          200: '#A3F7BF',
          300: '#73F29F',
          400: '#43ED7F',
          500: '#13E85F',
          600: '#0FB94C',
          700: '#0B8A39',
          800: '#075C26',
          900: '#042E13'
        },
        // Chrono Loop Theme
        twilight: {
          50: '#ECEDF5',
          100: '#D9DBEB',
          200: '#B3B7D7',
          300: '#8D93C3',
          400: '#676FAF',
          500: '#4F567E',
          600: '#393E6C',
          700: '#2D3157',
          800: '#212442',
          900: '#15172D'
        },
        sundial: {
          50: '#FEF9E8',
          100: '#FCF3D1',
          200: '#F9E7A3',
          300: '#F7DB75',
          400: '#F5D06F',
          500: '#F3C447',
          600: '#E6B73F',
          700: '#D9AA37',
          800: '#CC9D2F',
          900: '#BF9027'
        },
        timedust: {
          50: '#F5F5F6',
          100: '#EBECEE',
          200: '#D7D8DD',
          300: '#C3C4CC',
          400: '#AFB0BB',
          500: '#7A7C89',
          600: '#62636D',
          700: '#494A51',
          800: '#313235',
          900: '#191919'
        },
        oceanteal: {
          50: '#E6F3F3',
          100: '#CCE7E7',
          200: '#99CFCF',
          300: '#66B7B7',
          400: '#339F9F',
          500: '#008C8C',
          600: '#007070',
          700: '#005454',
          800: '#003838',
          900: '#001C1C'
        },
        // Warm Tech Theme
        'warm-tech': {
          soft: '#1C1C1E',
          taupe: '#A89F91',
          sand: '#D8C3A5',
          blue: '#4C6E91',
          ivory: '#FAF8F5'
        },
        // Bubblegum Bloom Theme
        bubblegum: {
          50: '#FFF5FA',
          100: '#FFEAF5',
          200: '#FFD3EC',
          300: '#FFB8DE',
          400: '#FF9DCE',
          500: '#FF7FBA',
          600: '#FF63A7',
          700: '#FF3E8D',
          800: '#D93276',
          900: '#B2275E'
        },
        cotton: {
          50: '#FDFBFC',
          100: '#FBF6F9',
          200: '#F8EEF4',
          300: '#F2DFEB',
          400: '#EACCE0',
          500: '#E2B5D3',
          600: '#D99FC6',
          700: '#CE83B7',
          800: '#C068A5',
          900: '#A24A88'
        },
        lavender: {
          50: '#FCFAFE',
          100: '#F6F0FD',
          200: '#EADAFB',
          300: '#DEC3F8',
          400: '#D2AAF4',
          500: '#BF85EF',
          600: '#A464D7',
          700: '#854BB4',
          800: '#653A8E',
          900: '#4C2C6C'
        },
        // Junk Punk Theme
        junkpunk: {
          50: '#FCFAF7',
          100: '#F1E9E2',
          200: '#E2D3C3',
          300: '#CDA68F',
          400: '#B8513C',
          500: '#981F23',
          600: '#5B0E14',
          700: '#0F0F10',
          800: '#1D1B1C',
          900: '#000000'
        },
        neonpunk: {
          50: '#FFF8FB',
          100: '#FFD3E4',
          200: '#FF9AC6',
          300: '#FF4DA1',
          400: '#E6007A',
          500: '#99004C',
          600: '#660033',
          700: '#33001A',
          800: '#19000D',
          900: '#000000'
        }
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.015)' },
        },
        swipeRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        heartbeat: 'heartbeat 1s ease-in-out',
        swipeRight: 'swipeRight 0.3s ease-out forwards',
        swipeLeft: 'swipeLeft 0.3s ease-out forwards'
      }
    },
  },
  plugins: [],
};