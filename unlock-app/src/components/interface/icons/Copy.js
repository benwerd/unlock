import React from 'react'

const Copy = props => (
  <svg xmlnsXlink="http://www.w3.org/1999/xlink" {...props}>
    <defs>
      <circle id="a" cx={12} cy={12} r={12} />
    </defs>
    <g fill="none" fillRule="evenodd">
      <mask id="b" fill="#fff">
        <use xlinkHref="#a" />
      </mask>
      <use fill="#EEE" xlinkHref="#a" />
      <g fill="#EEE" mask="url(#b)">
        <path d="M0 0h24v24H0z" />
      </g>
      <path
        fill="#A6A6A6"
        d="M17.625 16.25c-.207 0-.375.504-.375.343V6.625h-1.888c.002.033.013.064.013.097v.486c0 .162-.168.292-.375.292H9c-.207 0-.375-.13-.375-.292v-.486c0-.033.01-.064.013-.097H6.75v10.792h10.5v-.875c0-.161.168-.292.375-.292s.375.13.375.292v1.167c0 .16-.168.291-.375.291H6.375C6.168 18 6 17.87 6 17.709V6.333c0-.16.168-.292.375-.292h2.424c.302-.586.97-1.033 1.743-1.137C10.695 4.387 11.289 4 12 4c.71 0 1.305.387 1.458.904.772.104 1.44.551 1.743 1.137h2.424c.207 0 .375.131.375.292v10.26c0 .161-.168-.343-.375-.343zm-3-9.528c0-.65-.729-1.264-1.5-1.264-.207 0-.375-.13-.375-.291 0-.322-.336-.584-.75-.584s-.75.262-.75.584c0 .161-.168.291-.375.291-.771 0-1.5.614-1.5 1.264v.194h5.25v-.194zM9 14.583c0-.276.122-.5.272-.5h3.801c.15 0 .272.224.272.5 0 .277-.122.5-.272.5H9.272c-.15 0-.272-.223-.272-.5zM9 12.5c0-.276.122-.5.272-.5h5.43c.15 0 .272.224.272.5 0 .277-.122.5-.272.5h-5.43c-.15 0-.272-.223-.272-.5zm5.702-1.5h-5.43c-.15 0-.272-.223-.272-.5 0-.276.122-.5.272-.5h5.43c.15 0 .272.224.272.5 0 .277-.122.5-.272.5z"
      />
    </g>
  </svg>
)

export default Copy
