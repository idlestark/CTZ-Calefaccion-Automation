import React from "react";
import "./Index.css";
//importo registro del item...

type Props = {
  children: React.ReactNode;
};

function Index({ children }: Props) {
  return (
    <div className="m-0 modal-backdrop-custom w-100 h-100">
      <div className="modal-dialog rounded form-box-fixed">
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Index;
