import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { useCal, useSlot } from "../context";
import {createUseStyles} from 'react-jss'

const useStyles = createUseStyles({
    coverContainer: {
        width: 'calc(340px + 420px - 48px)',
        height: '36px',
        position: 'absolute',
        bottom: '124px',
        left: 'calc( 50% - ((340px + 420px - 48px) / 2 ) )',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
        '@media (max-width: 1024px)': {
            width: '612px',
            left: 'calc( 50% - ((612px) / 2 ) )',
        },
        '@media (max-width: 768px)': {
            width: 'calc(100% - 48px)',
            left: '24px',
            bottom: '42px',
        }
    },
    backCover: {
        width: '65px',
        height: '100%',
        pointerEvents: 'auto',
        cursor: 'pointer',
    },
    submitCover: {
        width: '86px',
        height: '100%',
        marginLeft: '8px',
    },
});

const CalEmbed = () => {
    const classes = useStyles()
    const calLink = useCal();
    const namespace = calLink.split("/").slice(-1)[0];
    const [slot, setSlot] = useSlot();

    console.log('slot', slot);

    useEffect(()=>{
        (async function () {
            const cal = await getCalApi({"namespace":namespace});
            cal("ui", {
                "layout":"month_view",
                "theme":"light",
            });
        })();
    }, []);

    return <div style={{position:'relative', width: '100%'}}>
        <div className={classes.coverContainer}>
            <div className={classes.backCover} onClick={() => setSlot(null)}></div>
            <div className={classes.submitCover}></div>
        </div>
        <Cal namespace={namespace}
            calLink={calLink}
            style={{width:"100%",height:"100%",overflow:"scroll"}}
            config={{
                "layout":"month_view",                 
                "slot":slot,
            }}
        />;
    </div>;
}

export default CalEmbed;