import { useEffect,useRef,useState } from "react";
import "./MemoPad.css";

function MemoPad(){
    const textAreaRef = useRef(null);
    const saveCounterRef = useRef(0);
    const [text, setText] = useState("");

    useEffect(()=>{
        textAreaRef.current.focus();
    },[]);

    const handleSave = () => {
        saveCounterRef.current += 1;
        console.log("Manual Save Count:", saveCounterRef.current);
    };

    return (
    <div className="memoContainer">
      <h1 className="memoTitle">Auto-Focus Memo Pad</h1>

      <textarea
        ref={textAreaRef}
        className="memoTextArea"
        placeholder="Start typing your notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button className="saveButton" onClick={handleSave}>
        Manual Save
      </button>

      <p className="infoText">
        Open console to see save count. UI does not re-render on save.
      </p>
    </div>
  );
}

export default MemoPad;