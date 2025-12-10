import { experimental_extendTheme as extendTheme} from '@mui/material/styles'

// Create a theme instance.
const theme = extendTheme({
  trelloCustoms: {
    appBarHeight: '48px',
    boardBarHeight: '58px'
  },
  colorSchemes: {
    light: {
      palette: {
        // primary: teal,
        // secondary: 
      }
    },
    dark: {
      // palette: {
      //   primary: teal
      // }
    }
  }
  // ...other properties
})

export default theme
