import * as React from 'react'
import styled from '@emotion/styled'

interface Props {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  width?: number
  height?: number
  color?: string
}

const SvgIcon: React.FC<Props> = ({ Icon, width, height, color }: Props) => {
  return (
    <SvgContainer width={width} height={height} color={color}>
      <Icon />
    </SvgContainer>
  )
}

export const SvgContainer = styled.i<{
  height?: number
  width?: number
}>`
  font-style: normal;
  display: inline-flex;
  width: ${(props) => (props.width ? `${props.width}px` : 'auto')};
  height: ${(props) => (props.height ? `${props.height}px` : 'auto')};
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.color ? `${props.color}` : 'inherit')};

  & svg {
    height: ${(props) => (props.height ? `${props.height}px` : '')};
    width: ${(props) => (props.width ? `${props.width}px` : '')};
  }
`

export {
  SvgIcon
}
