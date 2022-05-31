import RegExpTraductor, { parseDefinicion } from "./thompson";

test("Concatenacion", () => {
  const traductor = new RegExpTraductor("ab", 0, "test");
  expect(traductor.convert()).toBeTruthy();
});
test("OR", () => {
  const traductor = new RegExpTraductor("a|b", 0, "test");
  expect(traductor.convert()).toBeTruthy();
});
test("Kleene", () => {
  const traductor = new RegExpTraductor("a*", 0, "test");
  expect(traductor.convert()).toBeTruthy();
});

test("Parentesis", () => {
  const traductor = new RegExpTraductor("(a|b)*", 0, "test");
  expect(traductor.convert()).toBeTruthy();
});
test("Complejo", () => {
  const traductor = new RegExpTraductor("((ab|b)*)|c", 0, "test");
  expect(traductor.convert()).toBeTruthy();
});

test("ParseDefinicion regular", () => {
  const resultado = parseDefinicion("<a>-><b>\n<b>-><a>\n");
});
