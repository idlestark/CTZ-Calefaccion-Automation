import React from "react";
import "./Index.css";
//importo registro del item...

type Props = {
  children: React.ReactNode;
  edit?: boolean;
};

function Index({ children, edit }: Props) {
  return (
    <div className="m-0 modal-backdrop-custom w-100 h-100">
      <div className="modal-dialog rounded form-box-fixed">
        <div className="modal-content">
          {children}
          <div className="modal-footer d-flex justify-content-between">
            <div>
              {edit && (
                <button className="btn btn-danger me-1">eliminar</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
