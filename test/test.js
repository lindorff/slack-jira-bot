const expect = require('chai').expect;
const stalker = require('../stalker.js');

describe("regExpForProjects", function() {
    it("Should throw if no projects defined", function() {
        expect(() => stalker.regExpForProjects([])).to.throw();
    });

    it("Should return project in double parenthesis if only one project in array", function() {
        const projectName = "PROJ1";
        const result = stalker.regExpForProjects([projectName]);
        expect(result).to.equal(`((${projectName}))`);
    });

    it("Combine projects to valid regexp matching all projects in array", function() {
        const projectName1 = "PROJ1";
        const projectName2 = "PROJ2";
        
        const result = stalker.regExpForProjects([projectName1, projectName2]);
        expect(result).to.equal(`((${projectName1})|(${projectName2}))`);
    });
  });
