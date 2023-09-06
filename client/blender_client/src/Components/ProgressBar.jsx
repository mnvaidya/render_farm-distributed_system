import React from 'react'

export default function ProgressBar({ percentage }){
    const containerStyles = {
        height: 8,
        width: '15%',
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        marginLeft: '43%'
      }
    
      const fillerStyles = {
        height: '100%',
        width: `${percentage}%`,
        transition: '0.3s',
        backgroundColor: 'green',
        borderRadius: 'inherit',
        textAlign: 'right'
      }
    
    //   const labelStyles = {

    //     color: 'white',
    //     fontWeight: 'bold',
    //     fontSize: 10
    //   }
    
      return (
        <div style={containerStyles}>
          <div style={fillerStyles}>
            {/* <span style={labelStyles}>{`${percentage}%`}</span> */}
          </div>
        </div>
      );
}