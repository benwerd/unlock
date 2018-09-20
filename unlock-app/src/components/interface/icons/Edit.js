import React from 'react'

const Edit = props => (
  <svg xmlnsXlink="http://www.w3.org/1999/xlink" {...props}>
    <defs>
      <circle id="a" cx={12} cy={12} r={12} />
      <path
        id="c"
        d="M11.235 5.012l-6.606 6.61a.6.6 0 0 1-.235.145L.79 12.969a.598.598 0 0 1-.76-.76l1.201-3.606a.6.6 0 0 1 .145-.234l6.605-6.61c.461-.462.99-.723 1.53-.755.43-.027 1.2-.079 1.87.592.661.662.644 1.474.613 1.9-.038.534-.301 1.057-.76 1.516zm-.583-2.659c-.327-.329-.656-.486-.953-.465-.35.02-.663.264-.863.465L1.964 9.472v1.581h1.715l6.942-6.914c.202-.203.447-.516.473-.865.021-.297-.127-.607-.442-.921z"
      />
    </defs>
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <use xlinkHref="#a" />
      </mask>
      <use fill="#EEE" xlinkHref="#a" />
      <g fill="#EEE" mask="url(#b)">
        <path d="M0 0h24v24H0z" />
      </g>
      <g transform="translate(6 5)">
        <mask id="d" fill="#fff">
          <use xlinkHref="#c" />
        </mask>
        <use fill="#A6A6A6" xlinkHref="#c" />
        <g fill="#A6A6A6" mask="url(#d)">
          <path d="M-6-5h24v24H-6z" />
        </g>
      </g>
    </g>
  </svg>
)

export default Edit
