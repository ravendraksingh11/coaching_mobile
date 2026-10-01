if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/ravendrasingh/.gradle/caches/9.3.1/transforms/10faee81a27384707912b952c7c85606/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/libs/android.armeabi-v7a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/ravendrasingh/.gradle/caches/9.3.1/transforms/10faee81a27384707912b952c7c85606/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

