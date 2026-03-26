const React = require('react')
const { Text } = require('react-native')

function MockIcon({ name, ...props }) {
  return React.createElement(Text, props, name)
}

module.exports = {
  Ionicons: MockIcon,
  MaterialIcons: MockIcon,
  FontAwesome: MockIcon,
  Feather: MockIcon,
}
