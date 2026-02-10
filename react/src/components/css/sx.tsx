export const whiteInversedButton = {
    width: "170px",
    borderRadius: '12px',
    textTransform: 'none',
    color: 'black',
    border: '1px solid rgba(112, 112, 112, 0.3)',
    background: 'white',
    transition: '0.3s',
    '&:hover': {
        border: '1px solid rgba(255, 255, 255, 1)',
        background: 'rgba(82, 82, 82, 0.05)',
        color: "white"
    }
}

export const whiteSolidButton = {
    borderRadius: 3,     
    textTransform: 'none', 
    fontWeight: 'bold',
    boxShadow: 'none',   
    background: 'white', 
}

export const whiteOutlinedButton = {
   color: 'rgba(255,255,255,0.6)',
   textTransform: 'none',
   border: '1px solid rgba(141, 141, 141, 1)',
   borderRadius: 3,
   '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
}

export const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
        '&.Mui-focused fieldset': { borderColor: '#ffffffff' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffffff' }
};