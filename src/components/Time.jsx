



function Time(props){
    const time = props.time 
    const minutes = Math.floor((time % 360000) / 6000) + 60*Math.floor(time / 360000)
    const seconds = Math.floor((time % 6000) / 100) + 60*minutes
    const milliseconds = time % 100 

    return(
        <>
        {seconds}.{milliseconds}s
        </>
    )
}

export default Time 