interface TreadmillIllustrationProps {
  className?: string;
}

/** Side-view device illustration shared by the device card and connection prompt. */
export default function TreadmillIllustration({ className }: TreadmillIllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 160 110" fill="none" aria-hidden="true" focusable="false">
      <g stroke="#15191f" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="94" width="15" height="6" rx="2.5" fill="#878b8b" />
        <rect x="132" y="94" width="13" height="6" rx="2.5" fill="#878b8b" />
        <path d="M124 75L117 23L123 21L131 75Z" fill="#c4c6bf" />
        <path d="M105 25L122 21L132 6Q134 3 137 5Q138 7 136 10L126 26L107 30Q103 30 103 27Z" fill="#afb2af" />
        <path d="M119 76H136V82H119Z" fill="#eab65f" />
        <path d="M16 82L136 77Q150 77 151 87Q152 96 141 96H18Q9 96 9 90Q9 83 16 82Z" fill="#aaada8" />
        <path d="M19 84L130 80" stroke="#d5d6cf" strokeWidth="2" />
        <circle cx="140" cy="87" r="4" fill="#f2b95f" />
      </g>
    </svg>
  );
}
