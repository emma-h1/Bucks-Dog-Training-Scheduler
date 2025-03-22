const mockNavigate = jest.fn();

module.exports = {
  useNavigate: () => mockNavigate,
  // Add any other functions from react-router-dom that you need
};