# to get the total frames in scene

import bpy 
import sys

# for arg in sys.argv:
#     print(arg)

filePath = sys.argv[4]
# print("file path2: ", filePath)
bpy.ops.wm.open_mainfile(filepath=filePath)

total_frames = bpy.context.scene.frame_end

print(total_frames)


#####################

# import bpy
# import sys

# # Get the blend file path.
# blend_file_path = sys.argv[4]
# print("pathhh: ", blend_file_path)

# # Open the blend file.
# bpy.ops.import_scene.blend(filepath=blend_file_path)

# # Get the total number of frames.
# num_frames = bpy.context.scene.frame_end

# # Split the file into two parts.
# first_part = bpy.data.scenes["Scene"].frame_start
# second_part = first_part + num_frames // 2

# # Export the first part of the file.
# bpy.data.scenes["Scene"].frame_start = first_part
# bpy.ops.export_scene.blend(filepath="first_part.blend")
# print("first part saved")

# # Export the second part of the file.
# bpy.data.scenes["Scene"].frame_start = second_part
# bpy.ops.export_scene.blend(filepath="second_part.blend")
# print("second part saved")


##############################

# import bpy
# import sys

# # Load the original .blend file
# original_file_path = sys.argv[4]
# bpy.ops.wm.open_mainfile(filepath=original_file_path)

# start_frame_part1 = 1
# end_frame_part1 = 100

# start_frame_part2 = 101
# end_frame_part2 = 204

# scene_original = bpy.context.scene

# # Duplicate the scene
# bpy.ops.scene.new(type='LINK_COPY')
# scene_part1 = bpy.context.scene
# scene_part1.name = "Part1"

# bpy.ops.scene.new(type='LINK_COPY')
# scene_part2 = bpy.context.scene
# scene_part2.name = "Part2"

# scene_part1.frame_start = start_frame_part1
# scene_part1.frame_end = end_frame_part1

# scene_part2.frame_start = start_frame_part2
# scene_part2.frame_end = end_frame_part2

# def delete_keyframes(scene, start_frame, end_frame):
#     for obj in scene.objects:
#         for fcurve in obj.animation_data.action.fcurves:
#             for keyframe in fcurve.keyframe_points:
#                 if not (start_frame <= keyframe.co.x <= end_frame):
#                     fcurve.keyframe_points.remove(keyframe)

# delete_keyframes(scene_part1, start_frame_part1, end_frame_part1)
# delete_keyframes(scene_part2, start_frame_part2, end_frame_part2)

# bpy.ops.wm.save_as_mainfile(filepath="/home/xor/Desktop/blend_serv/blender_server/server/scenes/part1_file.blend")
# bpy.ops.wm.save_as_mainfile(filepath="/home/xor/Desktop/blend_serv/blender_server/server/scenes/part2_file.blend")

