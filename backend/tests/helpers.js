export function testFormation() {
  return (
    "TEST_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 8)
  );
}