if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/ravendrasingh/.gradle/caches/9.3.1/transforms/3e4916db54743df08099006d6d753a4b/transformed/hermes-android-250829098.0.17-debug/prefab/modules/hermesvm/libs/android.x86_64/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/ravendrasingh/.gradle/caches/9.3.1/transforms/3e4916db54743df08099006d6d753a4b/transformed/hermes-android-250829098.0.17-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

