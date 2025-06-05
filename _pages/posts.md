---
permalink: /cmake-notes
title: "CMake notes"
layout: single
---

Notes on git

git submodule add https://github.com/chaconinc/DbConnector [target_dir]
git submodule update --init

Notes on cmake

External libraries:
Example: glm library in lib subdirectory

To build the external library in subdirectory: 
add_subdirectory(lib/glm)
Need to also include the header files:
include_directories(lib/glm/glm)

If any src files are using the library, need to make sure the library is linked to the target:
target_link_libraries(src_files glm::glm)

Notes on valgrind
https://valgrind.org/docs/manual/quick-start.html​

Include cmake module​

Module load tools/cmake/3.13.2

cmake --build . [31s]​

cmake -DCMAKE_BUILD_TYPE=Release .. [23s]​