import type { ReactNode } from "react";

interface cardProps {
  children: ReactNode;
}

function Card(props: cardProps) {
  const { children } = props;
  const width = {
    width: "400px",
  };
  return (
    <div className="card" style={width}>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default Card;

interface cardBodyProps {
  title: String;
  subTitle: String;
  text: String;
}

export function CardBody(props: cardBodyProps) {
  const { title, subTitle, text } = props;
  return (
    <>
      <h5 className="card-title">{title}</h5>
      <h6 className="card-subtitle mb-2 text-body-secondary">{subTitle}</h6>
      <p className="card-text">{text}</p>
      <a href="#" className="card-link">
        Card link
      </a>
      <a href="#" className="card-link">
        Another link
      </a>
    </>
  );
}
