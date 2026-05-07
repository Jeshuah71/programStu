function SectionAnchor({ id, children, className = "" }) {
  return (
    <div id={id} className={`scroll-mt-28 ${className}`.trim()}>
      {children}
    </div>
  );
}

export default SectionAnchor;
