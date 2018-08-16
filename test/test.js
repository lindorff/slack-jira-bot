/*
Copyright 2018 Lindorff Oy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
