function SectionTitle({ title, subtitle, light = false }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-14">
      <h2
        className={`text-3xl md:text-5xl font-bold mb-4 ${
          light ? "text-white" : "text-[#603809]"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-base md:text-lg leading-loose ${
            light ? "text-white/85" : "text-[#707070]"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionTitle
